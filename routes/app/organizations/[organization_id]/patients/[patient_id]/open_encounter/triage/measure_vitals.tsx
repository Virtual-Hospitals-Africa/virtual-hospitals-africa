import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as vitals from '../../../../../../../../db/models/patient_vitals.ts'
import { patient_measurements } from '../../../../../../../../db/models/patient_measurements.ts'
import * as patient_categorical_findings from '../../../../../../../../db/models/patient_categorical_findings.ts'
import * as patient_computed_findings from '../../../../../../../../db/models/patient_computed_findings.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  positive_number,
  snomed_concept_id,
} from '../../../../../../../../util/validators.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import {
  getActiveConditionsSnomedCodesFromContext,
  VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
} from '../../../../../../../../shared/vitals.ts'
import {
  parseExpressionExpectingAtom,
} from '../../../../../../../../shared/s_expression.ts'
import { forEach, pMap } from '../../../../../../../../util/inParallel.ts'
import {
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  patient_findings,
} from '../../../../../../../../db/models/patient_findings.ts'
import keys from '../../../../../../../../util/keys.ts'
import entries from '../../../../../../../../util/entries.ts'
import { assert } from 'std/assert/assert.ts'
import fromEntries from '../../../../../../../../util/fromEntries.ts'
import { insertTasksIfNotAlreadyIdentified } from '../../../../../../../../db/models/additional_tasks.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'

const TriageMeasureVitalsSchema = z.object({
  measurements: z.partialRecord(
    z.enum(keys(VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS)),
    z.object({
      value: positive_number,
      units: z.string().min(1),
    }).strict(),
  ).optional().transform((measurements) =>
    fromEntries(
      entries(measurements || {}).map((
        [vital, measurement],
      ) => {
        assert(measurement)
        const { value, units } = measurement
        const snomed_concept_id = VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS[vital]
        const measurement_equality_expression = parseExpressionExpectingAtom(
          `(= (measurement ${snomed_concept_id}) (units ${value} ${units}))`,
          '=',
        )
        return [vital, measurement_equality_expression]
      }),
    )
  ),
  assessments: z.partialRecord(
    z.enum(keys(VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS)),
    z.object({
      value_snomed_concept_id: snomed_concept_id,
    }).strict(),
  ).optional().transform((assessments) =>
    fromEntries(
      entries(assessments || {}).map((
        [vital, assessment],
      ) => {
        assert(assessment)
        const { value_snomed_concept_id } = assessment
        const finding_snomed_concept_id =
          VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS[vital]
        const finding_expression = parseExpressionExpectingAtom(
          `(finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} ${finding_snomed_concept_id} ${value_snomed_concept_id})`,
          'finding',
        )
        return [vital, finding_expression]
      }),
    )
  ),
}).strict()

export const handler = postHandler(
  TriageMeasureVitalsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { trx, patient, encounter: { patient_encounter_id }, encounter_employee_presence: { patient_encounter_employee_id } } = ctx.state
    const patient_id = patient.id

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)

    // Insert measurements using DSL (pMap to collect results)
    const measurement_results = await pMap(
      entries(form_values.measurements),
      ([/* vital */, measurement_equality]) =>
        patient_measurements.insertOneNested(trx, {
          procedure_id,
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          measurement_equality,
        }).then((result) => ({
          finding_id: result.record_id,
          snomed_concept_id: measurement_equality.left.snomed_concept_id,
          value: measurement_equality.right.value,
          units: measurement_equality.right.units,
          record_id: result.record_id,
          procedure_id: result.procedure_id,
        })),
    )

    // Insert assessments using DSL
    await forEach(
      entries(form_values.assessments),
      ([/* vital */, finding]) =>
        patient_findings.insertOneNested(trx, {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          procedure_id,
          finding,
        }),
    )

    // Compute derived measurements (BMI, MAP, etc.) if we have measurements
    if (measurement_results.length > 0) {

      await patient_computed_findings.computeAndInsertDerivedMeasurements(
        trx,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          source_measurements: measurement_results,
          source_procedure_id: procedure_id,
        },
      )
    }

    await insertTasksIfNotAlreadyIdentified(trx, { patient_id, patient_encounter_id })

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageMeasureVitalsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false
  })

  // TODO: Ask Will if during triage we care about active conditions as far as measurements are concerned
  const active_condition_snomed_codes =
    getActiveConditionsSnomedCodesFromContext(
      ctx.state.patient_history,
    )

  const [vital_measurements_for_this_encounter, triage_assessments] =
    await Promise.all([
      vitals.measurementsNeededForTriageEncounter(
        ctx.state.trx,
        ctx.state.patient,
        active_condition_snomed_codes,
      ),
      patient_categorical_findings.getTriageAssessmentsWithOptions(
        ctx.state.trx,
      ),
    ])

  const snomed_concept_ids = [
    ...vital_measurements_for_this_encounter.map((o) => o.snomed_concept_id),
    ...triage_assessments.map((a) => a.assessment_snomed_concept_id),
  ]

  const most_recent_patient_vitals = await patient_vitals
    .getMostRecent(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
        patient_id: ctx.state.patient.id,
        snomed_concept_ids,
      },
    )

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={vital_measurements_for_this_encounter}
      triage_assessments={triage_assessments}
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageMeasureVitalsPage)
