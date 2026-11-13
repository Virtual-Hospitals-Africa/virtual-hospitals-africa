import { z } from 'zod'
import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, completedProcedure } from '../_middleware.tsx'
import type { TriageContext } from '../../../../../../../../types.ts'
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
import { BriefHistorySection } from '../../../../../../../../components/triage/BriefHistorySection.tsx'
import { patient_record_providers } from '../../../../../../../../db/models/patient_record_providers.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
import { redirectToRoutePatientIfEmergency, TriagePage } from './_middleware.tsx'
import { events } from '../../../../../../../../db/models/events.ts'
import { parseWithSchema } from '../../../../../../../../shared/s_expression.ts'
import { insertable_finding_base, InsertableFindingBase } from '../../../../../../../../shared/s_expression_schemas.ts'
import { snomed_concept_finding_like } from '../../../../../../../../db/models/snomed_concept_finding_like.ts'
import { patient_records_any_top_level } from '../../../../../../../../db/models/patient_records_any_top_level.ts'
import { SearchResult } from '../../../../../../../../db/models/_base.ts'
import { medication } from '../../../../../../../../shared/medication_s_expression.ts'
import { patient_medications_self_reported } from '../../../../../../../../db/models/patient_medications_self_reported.ts'
import { pMap } from '../../../../../../../../util/inParallel.ts'

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
  additional_chronic_conditions: AllergiesSchema.optional(),
  allergies: AllergiesSchema.optional(),
  // The medications the patient says they are taking. See shared/medication_s_expression.ts
  medication_s_expressions: medication.array().optional(),
})

function mostRecentRecords({ state }: TriageContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return brief_history.renderedMostRecentRecords(trx, {
    encounter,
    patient_id,
    health_worker_id,
    conditions: COMMON_CONDITIONS,
  })
}

function additionalChronicConditions({ state }: TriageContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return patient_records_any_top_level.findAll(trx, {
    patient_id,
    specific_snomed_concept_id: snomed_concept_finding_like.distinctIds(trx, { chronic: true }),
  }).then((records) =>
    patient_record_providers.hydrateIntermediateRecords(trx, {
      records: records as SearchResult<typeof patient_findings>[],
      encounter,
      health_worker_id,
    })
  )
}

function existingAllergies({ state }: TriageContext) {
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

function existingMedications({ state }: TriageContext) {
  const { trx, encounter, patient_id, health_worker_id } = state
  return patient_findings.findAll(trx, {
    patient_id,
    self_reported_medications: 'only',
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
): InsertableFindingBase {
  return parseWithSchema(
    `
    (finding 
      ${STATUS_ATTRIBUTE.s_expression}
      ${condition_snomed_concept.s_expression}
      ${patient_findings.QUALIFIERS_BY_EXISTENCE[existence].s_expression}
      (qualifier ${SELF_REPORTED_QUALIFIER.s_expression}))
  `,
    insertable_finding_base,
  )
}

export const handler = postHandler(
  TriageBriefHistorySchema,
  async (ctx: TriageContext, form_values) => {
    const {
      trx,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      workflow_step_snomed_concept,
      patient_age_determination,
    } = ctx.state

    const completed_procedure = await completedProcedure(ctx)
    const most_recent_findings = await mostRecentRecords(ctx)

    const findings_to_insert: InsertableFindingBase[] = []
    const altered_records: { record_id: string; condition_key: CommonConditionKey }[] = []

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
        altered_records.push({ record_id: prior_matching_finding!.id, condition_key })
      }

      findings_to_insert.push(
        selfReportedStatusSExpression(condition_snomed_concept, condition.existence),
      )
    }

    for (const condition of form_values.additional_chronic_conditions || []) {
      findings_to_insert.push(
        selfReportedStatusSExpression({
          s_expression: `(snomed_concept "${condition.name}" "${condition.category}")`,
        }, 'Yes'),
      )
    }

    for (const allergy of form_values.allergies || []) {
      findings_to_insert.push(
        parseWithSchema(
          `(clinical_finding (snomed_concept "${allergy.name}" "${allergy.category}"))`,
          insertable_finding_base,
        ),
      )
    }

    const { response, insert_result } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      insert_result: insertFindingsThenMedications(),
      _mark_altered: markAlteredRecords(),
    })

    if (insert_result) {
      await events.insert(trx, {
        type: 'FindingsAdded',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          procedure_id: insert_result.procedure_id,
          records: insert_result.findings,
        },
      })
    }

    return response

    function insertFindings() {
      if (!findings_to_insert.length) {
        assertOr400(
          completed_procedure,
          'Your first time submitting brief history there must be findings to insert',
        )
        return Promise.resolve()
      }

      return patient_findings.insertMany(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        patient_encounter_employee_id,
        patient_age_determination,
        findings: findings_to_insert,
        procedure: completed_procedure || {
          create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
        },
      })
    }

    /*
      Medications go in after the findings: one taken for a condition is related to the record
      of that condition, which may be among the findings just inserted. They are recorded under
      the same procedure as the findings, as part of the same history taking.
    */
    async function insertFindingsThenMedications() {
      const insert_result = await insertFindings()
      const medications = form_values.medication_s_expressions || []
      if (!medications.length) return insert_result

      const procedure_id = insert_result?.procedure_id ?? completed_procedure?.procedure_id
      assert(procedure_id, 'Either findings were just inserted under a procedure or one was completed before')

      await pMap(medications, (medication_s_expression) =>
        patient_medications_self_reported.insertOne(trx, {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          procedure_id,
          medication_s_expression,
        }))
      return insert_result
    }

    function markAlteredRecords() {
      if (!completed_procedure) {
        assertOr400(
          !altered_records.length,
          `With no previously completed procedure, there cannot be record alterations, but there was for ${altered_records[0]?.condition_key}`,
        )
        return
      }

      return markEnteredInError(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        altered_record_ids: altered_records.map((record) => record.record_id),
        ...completed_procedure,
      })
    }
  },
)

export async function TriageBriefHistoryPage(
  ctx: TriageContext,
) {
  redirectToRoutePatientIfEmergency(ctx)
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { organization_employment, patient } = ctx.state

  assert(completedPersonal(patient))

  const { most_recent_findings, additional_chronic_conditions, existing_allergies, existing_medications } = await promiseProps({
    most_recent_findings: mostRecentRecords(ctx),
    additional_chronic_conditions: additionalChronicConditions(ctx),
    existing_allergies: existingAllergies(ctx),
    existing_medications: existingMedications(ctx),
  })

  return (
    <BriefHistorySection
      most_recent_findings={most_recent_findings}
      additional_chronic_conditions={additional_chronic_conditions}
      existing_allergies={existing_allergies}
      existing_medications={existing_medications}
      sex={patient.sex}
      organization_id={organization_employment.id}
    />
  )
}

export default TriagePage(TriageBriefHistoryPage)
