import { completeAndProceedToNextStep, completedProcedure } from '../_middleware.tsx'
import type { TriageContext } from '../../../../../../../../types.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import WarningSignsPage from '../../../../../../../../islands/WarningSigns/Page.tsx'
import { FindingNodeToInsert, InsertedRecord, patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { filter } from '../../../../../../../../util/inParallel.ts'
import { WARNING_SIGNS } from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { assert } from 'std/assert/assert.ts'

import { AgeDetermination, CommonSymptom, TrxOrDb, WarningSign, WarningSignWithMaybeRecord } from '../../../../../../../../types.ts'
import { normalForm } from '../../../../../../../../shared/s_expression.ts'
import { asNormalFormSExpression } from '../../../../../../../../shared/patient_records.ts'
import partition from '../../../../../../../../util/partition.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'
import { ORDERED_PRIORITIES } from '../../../../../../../../shared/priorities.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { NO_QUALIFIER } from '../../../../../../../../shared/snomed_concepts.ts'

import { assertOr400, assertOr409 } from '../../../../../../../../util/assertOr.ts'
import { now } from '../../../../../../../../db/helpers.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { COMMON_SYMPTOMS } from '../../../../../../../../shared/common_symptoms.ts'

import sortBy from '../../../../../../../../util/sortBy.ts'
import type { InsertableFindingBase, MatchingFinding } from '../../../../../../../../shared/s_expression_schemas.ts'
import { brief_history } from '../../../../../../../../db/models/brief_history.ts'
import { COMMON_CONDITIONS } from '../../../../../../../../shared/brief_history.ts'
import { subsets } from '../../../../../../../../util/subsets.ts'
import { patient_findings_with_modifiers } from '../../../../../../../../db/models/patient_findings_with_modifiers.ts'
import { TriagePage } from './_middleware.tsx'
import { existingFindingsMatching } from '../../../../../../../../db/models/additional_tasks.ts'
import { inverseSExpression } from '../../../../../../../../shared/s_expression_inverse.ts'
import { TriageWarningSignsSchema } from '../../../../../../../../shared/warning_signs_post.ts'

const NoInsertOnAccountOfEveryUncheckedSignAlreadyRecorded = Symbol(
  'NoInsertOnAccountOfEveryUncheckedSignAlreadyRecorded',
)

type InsertedSummary = {
  procedure_id: string
  records: InsertedRecord[]
} | typeof NoInsertOnAccountOfEveryUncheckedSignAlreadyRecorded

/*
  Positive findings were saved one at a time through the clinical_finding route as they
  were checked, and removed through its mark_as_error route. So on submission the page
  vouches for the records it still shows (saved_record_ids), which must all be valid
  positive findings of this encounter and must account for every positive finding recorded
  under this step, and lists the signs left unchecked (none_of_these), each recorded as
  absent unless this encounter already has a record for it, of any existence.
*/
export const handler = postHandler(
  TriageWarningSignsSchema,
  async (ctx: TriageContext, { saved_record_ids, none_of_these }) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_age_determination,
      patient_encounter_employee_id,
      workflow_step_snomed_concept,
    } = ctx.state

    assert(workflow_step_snomed_concept)

    const completed_procedure = completedProcedure(ctx)

    for (const s_expression of none_of_these.s_expressions) {
      assertOr400(s_expression.existence === 'Yes', 'Send the unchecked signs as positive findings, they are recorded as absent here')
    }

    await assertSavedRecordsAreThePositiveFindings()
    const inserted = await insertUncheckedSignsAsAbsent()
    const response = await completeAndProceedToNextStep(ctx)
    await dispatchEvent(inserted)

    return response

    async function assertSavedRecordsAreThePositiveFindings() {
      const valid_positive_findings = await patient_findings.findAll(trx, {
        patient_id,
        patient_encounter_id,
        not_measurements: true,
      })
      const valid_positive_ids = new Set(valid_positive_findings.map((finding) => finding.id))
      const claimed_ids = new Set(saved_record_ids)

      const not_valid = saved_record_ids.filter((id) => !valid_positive_ids.has(id))
      assertOr409(
        !not_valid.length,
        `These saved_record_ids are not valid positive findings of this encounter: ${not_valid.join(', ')}`,
      )

      const not_resubmitted = valid_positive_findings
        .filter((finding) => completed_procedure && finding.as_part_of_procedure?.id === completed_procedure.procedure_id)
        .filter((finding) => !claimed_ids.has(finding.id))
        .map((finding) => finding.id)
      assertOr409(
        !not_resubmitted.length,
        `It is expected that the frontend resubmit the records of positive findings saved from this page. Missing: ${not_resubmitted.join(', ')}`,
      )
    }

    async function insertUncheckedSignsAsAbsent(): Promise<InsertedSummary> {
      const nodes = new Map<string, InsertableFindingBase>()
      for (const node of none_of_these.s_expressions) {
        nodes.set(inverseSExpression(node), node)
      }

      const matching = new Map<string, MatchingFinding>(
        nodes.entries().map(([s_expression, node]) => [s_expression, { ...node, existence: 'Any' }]),
      )
      const existing_findings = await existingFindingsMatching(trx, { patient_id, patient_encounter_id, nodes: matching })
      const already_recorded = new Set(existing_findings.map((finding) => finding.s_expression))

      const findings_to_insert = [...nodes.entries()]
        .filter(([s_expression]) => !already_recorded.has(s_expression))
        .map(([, node]): FindingNodeToInsert => ({
          ...node,
          existence: 'No',
          value_snomed_concept: { atom: 'snomed_concept', ...NO_QUALIFIER },
        }))

      if (!findings_to_insert.length) return NoInsertOnAccountOfEveryUncheckedSignAlreadyRecorded

      const { success, procedure_id, findings } = await patient_findings.insertMany(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          patient_age_determination,
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
      if (inserted === NoInsertOnAccountOfEveryUncheckedSignAlreadyRecorded) return
      return events.insert(trx, {
        type: 'FindingsAdded',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          ...inserted,
        },
      })
    }
  },
)

function getAllFindingsReportedPreviouslyOnThisPage(
  ctx: TriageContext,
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

  // We don't use the value when calculating the normal form
  // of the s_expression here so that negative findings match.
  // That is if a previous submission found no chest pain,
  // then that should match and be the finding corresponding to
  // the chest pain warning sign.
  function normalFormOf(
    prior_finding: SearchResult<typeof patient_findings_with_modifiers>,
    modifiers: typeof prior_finding.modifiers,
    attributes: typeof prior_finding.attributes,
  ) {
    return asNormalFormSExpression({ ...prior_finding, modifiers, attributes, existence: 'Yes', value: null })
  }

  // Findings may add qualifiers or attributes. So we look for any subset of them when looking for matches
  // With a modest size of these, this should not get out of hand.
  // Several findings can produce the same key (Burn, and Moderate Burn without its qualifier), so a
  // finding as recorded in full claims a key ahead of any finding's subset, and positive ahead of
  // negative. Otherwise the negative Moderate Burn could stand in for the sign matching the positive Burn.
  const prior_findings_positive_first = sortBy(prior_findings, (finding) => finding.existence === 'Yes' ? 0 : 1)
  for (const prior_finding of prior_findings_positive_first) {
    const in_full = normalFormOf(prior_finding, prior_finding.modifiers, prior_finding.attributes)
    if (!prior_findings_map.has(in_full)) prior_findings_map.set(in_full, prior_finding)
  }
  for (const prior_finding of prior_findings_positive_first) {
    for (const modifier_subset of subsets(prior_finding.modifiers)) {
      for (const attribute_subset of subsets(prior_finding.attributes)) {
        const as_subset = normalFormOf(prior_finding, modifier_subset, attribute_subset)
        if (!prior_findings_map.has(as_subset)) prior_findings_map.set(as_subset, prior_finding)
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
      // As with every sign, the s_expression is of the finding itself; whether it was present is existing_record's to say
      clinical_finding_s_expression: normalFormOf(finding, finding.modifiers, finding.attributes),
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
  { state: { trx, patient_id, encounter, health_worker_id } }: TriageContext,
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
  ctx: TriageContext,
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
      findings_to_check_for_route={`${ctx.state.open_encounter_pathname}/findings_to_check_for`}
      none_of_the_above_findings_route={`${ctx.state.open_encounter_pathname}/none_of_the_above_findings`}
      warning_signs={Array.from(warning_signs)}
    />
  )
}

export default TriagePage(TriageWarningSignsPage)
