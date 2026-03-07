import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  completedProcedure,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import { FindingNodeToInsert, patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { filter } from '../../../../../../../../util/inParallel.ts'
import { WARNING_SIGNS } from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { assert } from 'std/assert/assert.ts'

import { CommonSymptom, WarningSign, WarningSignWithMaybeRecord } from '../../../../../../../../types.ts'
import { normalForm, sExpressionZodValidator } from '../../../../../../../../shared/s_expression.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import hrefFromCtx from '../../../../../../../../util/hrefFromCtx.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import partition from '../../../../../../../../util/partition.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'
import { ORDERED_PRIORITIES } from '../../../../../../../../shared/priorities.ts'
import values from '../../../../../../../../util/values.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { NO_QUALIFIER } from '../../../../../../../../shared/snomed_concepts.ts'

import { assertOr409 } from '../../../../../../../../util/assertOr.ts'
import zip from '../../../../../../../../util/zip.ts'
import { humanReadableJson } from '../../../../../../../../util/humanReadableJson.ts'
import { now } from '../../../../../../../../db/helpers.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import compactMap from '../../../../../../../../util/compactMap.ts'
import { COMMON_SYMPTOMS } from '../../../../../../../../shared/common_symptoms.ts'

import sortBy from '../../../../../../../../util/sortBy.ts'
import { insertable_finding_base } from '../../../../../../../../shared/s_expression_schemas.ts'

export const EmergencyEscalationEmergencyReasonSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: z.enum(['Yes', 'No']).optional().transform((existence) => existence || 'No'),
  warning_sign_key: z.string().optional(),
  priority_level: z.enum(ORDERED_PRIORITIES).optional(),
  existing_record: z.object({
    id: z.string(),
    altered: z.boolean().optional(),
  }).optional(),
}).strict()

export const EmergencyEscalationReasonsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    EmergencyEscalationEmergencyReasonSchema,
  ).optional().default({}).transform(values),
  __test_only_skip_inserting_negative_findings: z.boolean().optional(),
}).strict()

const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = Symbol(
  'NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges',
)

type InsertedSummary = {
  procedure_id: string
  records: { id: string; existence: 'Yes' | 'No' }[]
} | typeof NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges

export const handler = postHandler(
  EmergencyEscalationReasonsSchema,
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
      const client_said_was_altered = !!just_submitted.existing_record?.altered
      const was_indeed_altered = just_submitted.existence !== previous_finding.existence
      assertOr409(
        client_said_was_altered === was_indeed_altered,
        `It is expected that the frontend keep track of whether the previously submitted record was altered. Detected a mismatch for ${previous_finding.id} which had existence: ${previous_finding.existence}, but just_submitted.existence: ${just_submitted?.existence}`,
      )
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

      const { success, procedure_id, finding_ids } = await patient_findings.insertMany(
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

      const records = Array.from(
        zip(finding_ids, needing_insert).map(([id, { existence }]) => ({
          id,
          existence,
        })),
      )

      return { records, procedure_id }
    }

    function dispatchEvent(
      inserted: InsertedSummary,
    ) {
      if (inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges) return
      return events.insert(trx, {
        type: 'ProcedureCompleted',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          workflow,
          step,
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
  return patient_findings.findAll(trx, {
    patient_id,
    patient_encounter_id,
    ...completed_procedure,
    include_negative: true,
    before: now,
  })
}

async function getWarningSignsForPatient(
  { state: { trx, patient_id } }: OpenEncounterWorkflowContext,
): Promise<WarningSign[]> {
  const [having_prompt_when, no_prompt_when] = partition(
    WARNING_SIGNS.adult,
    (sign) => !!sign.prompt_when_s_expression,
  )
  const satisfying_prompt_when = await filter(having_prompt_when, promptWhen)
  const warning_signs_for_patient = [...no_prompt_when, ...satisfying_prompt_when]
  return sortBy(
    warning_signs_for_patient,
    (sign) => ORDERED_PRIORITIES.indexOf(sign.priority),
    (sign) => WARNING_SIGNS.adult.indexOf(sign),
  )

  async function promptWhen({ prompt_when_s_expression }: WarningSign) {
    assert(prompt_when_s_expression)
    const { satisfies } = await satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression,
    })
    return satisfies
  }
}

function* signsMatchedWithPriorRecords(
  prior_findings: SearchResult<typeof patient_findings>[],
  warning_signs_for_patient: WarningSign[],
  common_symptoms: CommonSymptom[],
): Generator<WarningSignWithMaybeRecord> {
  const findings_set = new Set(prior_findings.map((finding) => {
    // We don't use the value when calculating the normal form
    // of the s_expression here so that negative findings match.
    // That is if a previous submission found no chest pain,
    // then that should match and be the finding corresponding to
    // the chest pain warning sign.
    const normal_form_s_expression = asNormalFormSExpression({
      ...finding,
      value: null,
    })
    const existing_record = {
      id: finding.id,
      existence: finding.existence,
    }

    return { ...finding, normal_form_s_expression, existing_record }
  }))

  const warning_signs_and_common_symptoms: Array<WarningSign | CommonSymptom> = [
    ...warning_signs_for_patient,
    ...common_symptoms,
  ]

  // Loop over the signs looking for findings that have identical
  // s_expressions, removing them as we go. Any that are left
  // over we send as well (these were the result of search)
  for (const sign of warning_signs_and_common_symptoms) {
    let existing_record: WarningSignWithMaybeRecord['existing_record']

    for (const finding of findings_set) {
      assert(sign.clinical_finding_s_expression === normalForm(sign.clinical_finding_s_expression), 'Comparing concepts requires they be in normal form')
      const is_same_concept = finding.normal_form_s_expression === sign.clinical_finding_s_expression

      if (is_same_concept) {
        existing_record = finding.existing_record
        findings_set.delete(finding)
        break
      }
    }

    yield { ...sign, existing_record }
  }

  for (const finding of findings_set) {
    yield {
      priority: finding.priority,
      clinical_finding_s_expression: finding.normal_form_s_expression,
      name: finding.specific_snomed_concept_name,
      description: finding.specific_snomed_concept_category,
      existing_record: finding.existing_record,
      category: 'Prior record' as const,
    }
  }
}

export async function EmergencyEscalationReasonPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })
  const {
    prior_findings,
    warning_signs_for_patient,
  } = await promiseProps({
    prior_findings: getAllFindingsReportedPreviouslyOnThisPage(ctx),
    warning_signs_for_patient: getWarningSignsForPatient(ctx),
  })

  const warning_signs = signsMatchedWithPriorRecords(
    prior_findings,
    warning_signs_for_patient,
    COMMON_SYMPTOMS,
  )

  return (
    <WarningSigns
      search_route={hrefFromCtx(ctx, (url) => {
        url.pathname = url.pathname.replace(
          '/emergency_escalation/emergency_reason',
          '/snomed-warning-signs',
        )
      })}
      warning_signs={Array.from(warning_signs)}
    />
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationReasonPage)
