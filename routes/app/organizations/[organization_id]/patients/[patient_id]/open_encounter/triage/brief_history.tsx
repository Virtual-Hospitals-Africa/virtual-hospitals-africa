import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  completedProcedure,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { snomed_category, snomed_concept_id, yes_no_unknown } from '../../../../../../../../util/validators.ts'
import { brief_history } from '../../../../../../../../db/models/brief_history.ts'
import entries from '../../../../../../../../util/entries.ts'
import { Existence } from '../../../../../../../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { COMMON_CONDITIONS, CommonConditionKey, commonConditionSnomedConcept } from '../../../../../../../../shared/brief_history.ts'
import { SELF_REPORTED_QUALIFIER, STATUS_ATTRIBUTE } from '../../../../../../../../shared/snomed_concepts.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

import { exists } from '../../../../../../../../util/exists.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import { BriefHistorySection } from '../../../../../../../../components/triage/BriefHistorySection.tsx'
import { patient_record_providers } from '../../../../../../../../db/models/patient_record_providers.ts'

const ConditionSchemaOptional = z.object(
  {
    existence: yes_no_unknown.optional(),
  },
).optional()

const ConditionSchemaRequired = z.object(
  {
    existence: yes_no_unknown,
  },
)

const AllergiesSchema = z.object({
  id: snomed_concept_id,
  name: z.string(),
  category: snomed_category,
}).array()

const CommonConditionSchema = z.object(
  {
    diabetes: ConditionSchemaRequired,
    pregnancy: ConditionSchemaRequired,
    tuberculosis: ConditionSchemaOptional,
    hiv: ConditionSchemaOptional,
    asthma: ConditionSchemaOptional,
    copd: ConditionSchemaOptional,
    covid19: ConditionSchemaOptional,
    heart_disease: ConditionSchemaOptional,
    mental_disorder: ConditionSchemaOptional,
    epilepsy: ConditionSchemaOptional,
    arthritis: ConditionSchemaOptional,
    cancer: ConditionSchemaOptional,
  } satisfies {
    [k in CommonConditionKey]: unknown
  },
)

export const TriageBriefHistorySchema = z.object({
  common_conditions: CommonConditionSchema,
  allergies: AllergiesSchema.optional(),
})

function mostRecentRecords({ state }: OpenEncounterWorkflowContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return brief_history.renderedMostRecentRecords(trx, {
    encounter,
    patient_id,
    health_worker_id,
    conditions: COMMON_CONDITIONS,
  })
}

function existingAllergies({ state }: OpenEncounterWorkflowContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return patient_findings.findAll(trx, {
    patient_id,
    s_expression: '(allergy)',
  }).then((records) =>
    patient_record_providers.hydrateIntermediateRecords(trx, {
      records,
      encounter,
      health_worker_id,
    })
  )
}

function selfReportedStatusSExpression(
  condition_snomed_concept: { s_expression: string },
  existence: Existence,
): string {
  return `
    (finding 
      ${STATUS_ATTRIBUTE.s_expression}
      ${condition_snomed_concept.s_expression}
      ${patient_findings.QUALIFIERS_BY_EXISTENCE[existence].s_expression}
      (qualifier ${SELF_REPORTED_QUALIFIER.s_expression}))
  `.trim()
}

export const handler = postHandler(
  TriageBriefHistorySchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_step_snomed_concept,
    } = ctx.state

    const completed_procedure = completedProcedure(ctx)
    const most_recent_findings = await mostRecentRecords(ctx)

    const findings_to_insert: string[] = []
    const altered_record_ids: string[] = []

    for (const [condition_key, condition] of entries(form_values.common_conditions)) {
      if (condition?.existence === undefined) continue

      const condition_snomed_concept = commonConditionSnomedConcept(condition_key)
      const prior_matching_finding = most_recent_findings[condition_key]

      if (
        prior_matching_finding?.existence === 'Yes' &&
        condition.existence === 'Yes'
      ) {
        continue
      }

      if (prior_matching_finding?.patient_encounter_id === patient_encounter_id) {
        altered_record_ids.push(prior_matching_finding.id)
      }

      findings_to_insert.push(
        selfReportedStatusSExpression(condition_snomed_concept, condition.existence),
      )
    }

    for (const allergy of form_values.allergies || []) {
      findings_to_insert.push(`(clinical_finding (snomed_concept "${allergy.name}" "${allergy.category}"))`)
    }

    const { response } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      _insert: insertFindings(),
      _mark_altered: markAlteredRecords(),
    })

    return response

    function insertFindings() {
      if (!findings_to_insert.length) {
        assert(
          completed_procedure,
          'Your first time submitting brief history there must be findings to insert',
        )
        return
      }

      return patient_findings.insertMany(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        patient_encounter_employee_id,
        findings: findings_to_insert,
        procedure: completed_procedure || {
          create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
        },
      })
    }

    function markAlteredRecords() {
      if (!completed_procedure) {
        assert(
          !altered_record_ids.length,
          'With no previously completed procedure, there cannot be record alterations',
        )
        return
      }

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

export async function TriageBriefHistoryPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { trx, encounter, patient_encounter_id, organization_employment } = ctx.state
  const { patient } = encounter

  assert(completedPersonal(patient))

  const { most_recent_findings, existing_allergies } = await promiseProps({
    // In practice, events won't add any findings that we might have here
    _: events.allProcessedForEncounter(trx, { patient_encounter_id }),
    most_recent_findings: mostRecentRecords(ctx),
    existing_allergies: existingAllergies(ctx),
  })

  return (
    <BriefHistorySection
      most_recent_findings={most_recent_findings}
      existing_allergies={existing_allergies}
      sex={patient.sex}
      organization_id={organization_employment.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageBriefHistoryPage)
