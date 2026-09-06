import { completeAndProceedToNextStep, completedProcedure, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import WarningSignsPage from '../../../../../../../../islands/WarningSigns/Page.tsx'
import { FindingNodeToInsert, InsertedRecord, patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { filter } from '../../../../../../../../util/inParallel.ts'
import { WARNING_SIGNS } from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { assert } from 'std/assert/assert.ts'

import { AgeDetermination, CommonSymptom, TrxOrDb, WarningSign, WarningSignWithMaybeRecord } from '../../../../../../../../types.ts'
import { normalForm, sExpressionZodValidator } from '../../../../../../../../shared/s_expression.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import partition from '../../../../../../../../util/partition.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'
import { ORDERED_PRIORITIES } from '../../../../../../../../shared/priorities.ts'
import values from '../../../../../../../../util/values.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { NO_QUALIFIER } from '../../../../../../../../shared/snomed_concepts.ts'

import { assertOr409 } from '../../../../../../../../util/assertOr.ts'
import { humanReadableJson } from '../../../../../../../../util/humanReadableJson.ts'
import { now } from '../../../../../../../../db/helpers.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import compactMap from '../../../../../../../../util/compactMap.ts'
import { COMMON_SYMPTOMS } from '../../../../../../../../shared/common_symptoms.ts'

import sortBy from '../../../../../../../../util/sortBy.ts'
import { insertable_finding_base } from '../../../../../../../../shared/s_expression_schemas.ts'
import { brief_history } from '../../../../../../../../db/models/brief_history.ts'
import { COMMON_CONDITIONS } from '../../../../../../../../shared/brief_history.ts'
import { subsets } from '../../../../../../../../util/subsets.ts'
import { patient_findings_with_modifiers } from '../../../../../../../../db/models/patient_findings_with_modifiers.ts'

export const TriageWarningSignSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: z.enum(['Yes', 'No']).optional().transform((existence) => existence || 'No'),
  warning_sign_key: z.string().optional(),
  priority_level: z.enum(ORDERED_PRIORITIES).optional(),
  existing_record: z.object({
    id: z.string(),
    altered: z.boolean().optional(),
  }).optional(),
})

export const TriageWarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    TriageWarningSignSchema,
  ).optional().default({}).transform(values),
  __test_only_skip_inserting_negative_findings: z.boolean().optional(),
})

const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = Symbol(
  'NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges',
)

type InsertedSummary = {
  procedure_id: string
  records: InsertedRecord[]
} | typeof NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges

export const handler = postHandler(
  TriageWarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      workflow,
      step,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_age_determination,
      patient_encounter_employee_id,
      workflow_step_snomed_concept,
    } = ctx.state

    assert(workflow_step_snomed_concept)
    const completed_procedure = completedProcedure(ctx)

    const { response, inserted, previously_reported } = await promiseProps({
      previously_reported: getAllFindingsReportedPreviouslyOnThisPage(ctx),
      inserted: insertSigns(),
      response: completeAndProceedToNextStep(ctx),
      mark_modified_as_invalid: markAlteredRecords(),
    })

    for (const previous_finding of previously_reported) {
      const just_submitted = form_values.warning_signs.find((submitted) => submitted.existing_record?.id === previous_finding.id)
      assertOr409(
        just_submitted,
        `It is expected that the frontend resubmit previously submitted records. Missing: ${humanReadableJson(previous_finding)}`,
      )
      // TODO: More than just existence now, we also can alter a recored by adding a finding site
      // const client_said_was_altered = !!just_submitted.existing_record?.altered
      // const was_indeed_altered = just_submitted.existence !== previous_finding.existence
      // assertOr409(
      //   client_said_was_altered === was_indeed_altered,
      //   `It is expected that the frontend keep track of whether the previously submitted record was altered. Detected a mismatch for ${previous_finding.id} which had existence: ${previous_finding.existence}, but just_submitted.existence: ${just_submitted?.existence}`,
      // )
    }

    await dispatchEvent(inserted)

    return response

    async function insertSigns(): Promise<InsertedSummary> {
      const needing_insert = form_values.warning_signs
        .filter((sign) => !sign.existing_record || sign.existing_record.altered)
        .filter((sign) => sign.existence === 'Yes' || !form_values.__test_only_skip_inserting_negative_findings)

      const findings_to_insert = needing_insert.map((
        sign,
      ): FindingNodeToInsert => ({
        ...sign.s_expression,
        priority: sign.existence === 'Yes' && sign.priority_level
          ? {
            level: sign.priority_level,
            by_system: true,
          }
          : null,
        value_snomed_concept: sign.existence === 'Yes' ? null : {
          atom: 'snomed_concept',
          ...NO_QUALIFIER,
        },
      }))

      if (!findings_to_insert.length) {
        assert(
          completed_procedure,
          'Your first time submitting warning signs there must be findings to insert',
        )
        return NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges
      }

      const { success, procedure_id, findings } = await patient_findings.insertMany(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          findings: findings_to_insert,
          procedure: completed_procedure || {
            create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
          },
        },
      )
      assert(success)
      assert(procedure_id)

      return { records: findings, procedure_id }
    }

    function dispatchEvent(
      inserted: InsertedSummary,
    ) {
      if (inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges) return
      return events.insert(trx, {
        type: 'ProcedureCompleted',
        data: {
          workflow,
          step,
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          ...inserted,
        },
      })
    }

    function markAlteredRecords() {
      if (!completed_procedure) {
        for (const sign of form_values.warning_signs) {
          assertOr409(
            !sign.existing_record?.altered,
            'With no previously completed procedure, there cannot be record alterations',
          )
        }
        return
      }

      const altered_record_ids = compactMap(
        form_values.warning_signs,
        (sign) => sign.existing_record?.altered && sign.existing_record.id,
      )

      return markEnteredInError(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        altered_record_ids,
        ...completed_procedure,
      })
    }
  },
)

function getAllFindingsReportedPreviouslyOnThisPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, patient_id, patient_encounter_id } = ctx.state
  const completed_procedure = completedProcedure(ctx)
  if (!completed_procedure) return Promise.resolve([])
  return patient_findings_with_modifiers.findAll(trx, {
    patient_id,
    patient_encounter_id,
    ...completed_procedure,
    // Leave in so we don't overwrite these records
    include_negative: true,
    before: now,
  })
}

export async function getWarningSignsForPatient(
  trx: TrxOrDb,
  patient_id: string,
  patient_age_determination: AgeDetermination | null = null,
): Promise<WarningSign[]> {
  const signs = WARNING_SIGNS[patient_age_determination || 'adult']
  const [having_prompt_when, no_prompt_when] = partition(
    signs,
    (sign) => !!sign.prompt_when_s_expression || !!sign.prompt_when_not_s_expression,
  )
  const satisfying_prompt_when = await filter(having_prompt_when, promptWhen)
  const warning_signs_for_patient = [...no_prompt_when, ...satisfying_prompt_when]
  return sortBy(
    warning_signs_for_patient,
    (sign) => ORDERED_PRIORITIES.indexOf(sign.priority),
    (sign) => signs.indexOf(sign),
  )

  async function promptWhen({ prompt_when_s_expression, prompt_when_not_s_expression }: WarningSign) {
    assert(Number(!!prompt_when_s_expression) + Number(!!prompt_when_not_s_expression) === 1)
    const { satisfies } = await satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression || prompt_when_not_s_expression!,
    })
    return prompt_when_s_expression ? satisfies : !satisfies
  }
}

function* signsMatchedWithPriorRecords(
  prior_findings: SearchResult<typeof patient_findings_with_modifiers>[],
  warning_signs_for_patient: WarningSign[],
  common_symptoms: CommonSymptom[],
): Generator<WarningSignWithMaybeRecord> {
  const prior_findings_remaining = new Set(prior_findings)
  const prior_findings_map = new Map<string, SearchResult<typeof patient_findings_with_modifiers>>()
  // Findings may add qualifiers or attributes. So we look for any subset of them when looking for matches
  // With a modest size of these, this should not get out of hand
  for (const prior_finding of prior_findings) {
    for (const modifier_subset of subsets(prior_finding.modifiers)) {
      for (const attribute_subset of subsets(prior_finding.attributes)) {
        // We don't use the value when calculating the normal form
        // of the s_expression here so that negative findings match.
        // That is if a previous submission found no chest pain,
        // then that should match and be the finding corresponding to
        // the chest pain warning sign.
        const normal_form_s_expression = asNormalFormSExpression({
          ...prior_finding,
          modifiers: modifier_subset,
          attributes: attribute_subset,
          existence: 'Yes',
          value: null,
        })
        prior_findings_map.set(normal_form_s_expression, prior_finding)
      }
    }
  }

  const warning_signs_and_common_symptoms: Array<WarningSign | CommonSymptom> = [
    ...warning_signs_for_patient,
    ...common_symptoms,
  ]

  // Loop over the signs looking for findings that have identical
  // s_expressions, removing them as we go. Any that are left
  // over we send as well (these were the result of search)
  for (const sign of warning_signs_and_common_symptoms) {
    let existing_record: WarningSignWithMaybeRecord['existing_record']
    // Normalize the sign's s_expression (WARNING_SIGNS use 'clinical_finding' atom,
    // map keys use 'finding' atom from asNormalFormSExpression)
    const normalized_sign_s_expression = normalForm(sign.clinical_finding_s_expression)
    const matching_prior_finding = prior_findings_map.get(normalized_sign_s_expression)

    if (matching_prior_finding) {
      existing_record = {
        id: matching_prior_finding.id,
        existence: matching_prior_finding.existence,
      }
      if (matching_prior_finding.existence === 'Yes') {
        const canonical_normal_form = asNormalFormSExpression({
          ...matching_prior_finding,
          value: null,
        })
        if (canonical_normal_form !== normalized_sign_s_expression) {
          existing_record!.augmented = {
            s_expression: canonical_normal_form,
            display: matching_prior_finding.displays.full,
            priority: matching_prior_finding.priority,
          }
        }
      }
      prior_findings_remaining.delete(matching_prior_finding)
    }
    yield {
      ...sign,
      existing_record,
    }
  }

  for (const finding of prior_findings_remaining) {
    yield {
      priority: finding.priority,
      clinical_finding_s_expression: asNormalFormSExpression({
        ...finding,
        value: null,
      }),
      name: finding.specific_snomed_concept_name,
      description: finding.specific_snomed_concept_category,
      existing_record: {
        id: finding.id,
        existence: finding.existence,
      },
      predefined_attributes: finding.predefined_attributes,
      relevant_qualifiers: finding.relevant_qualifiers,
      onset_required: finding.onset_required,
      category: 'Prior record' as const,
    }
  }
}

function getBriefHistory(
  { state: { trx, patient_id, encounter, health_worker_id } }: OpenEncounterWorkflowContext,
) {
  return brief_history.renderedMostRecentRecords(
    trx,
    {
      patient_id,
      encounter,
      health_worker_id,
      conditions: COMMON_CONDITIONS.filter((condition) => condition.key === 'pregnancy'),
    },
  )
}

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    prior_findings,
    warning_signs_for_patient,
    brief_history,
  } = await promiseProps({
    prior_findings: getAllFindingsReportedPreviouslyOnThisPage(ctx),
    warning_signs_for_patient: getWarningSignsForPatient(ctx.state.trx, ctx.state.patient_id, ctx.state.patient_age_determination),
    brief_history: getBriefHistory(ctx),
  })

  const warning_signs = signsMatchedWithPriorRecords(
    prior_findings,
    warning_signs_for_patient,
    COMMON_SYMPTOMS,
  )

  const warning_signs_search_params = new URLSearchParams()
  warning_signs_search_params.set('age_determination', exists(ctx.state.patient_age_determination))
  if (brief_history.pregnancy?.existence === 'Yes') {
    warning_signs_search_params.set('pregnancy', 'true')
  }

  return (
    <WarningSignsPage
      search_route={`/app/snomed/warning-signs?${warning_signs_search_params}`}
      post_route={`${ctx.state.open_encounter_pathname}/clinical_finding`}
      warning_signs={Array.from(warning_signs)}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
