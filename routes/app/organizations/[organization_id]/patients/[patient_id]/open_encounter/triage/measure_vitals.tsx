import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { patient_measurements } from '../../../../../../../../db/models/patient_measurements.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  positive_number,
  snomed_concept_id,
} from '../../../../../../../../util/validators.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import {
ALL_VITALS_SNOMED_CONCEPT_IDS,
  getScoreForAssessment,
  getScoreForMeasurement,
  measureVitalsInputDefinitions,
  SEVERITY_SCORE_SNOMED_CONCEPT_ID,
  VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
  VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
} from '../../../../../../../../shared/vitals.ts'
import {
  parseExpressionExpectingAtom,
} from '../../../../../../../../shared/s_expression.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
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
import { renderedMostRecentFindings } from '../../../../../../../../db/models/brief_history.ts'
import { COMMON_CONDITIONS } from '../../../../../../../../shared/brief_history.ts'
import { patientAgeDetermination } from '../../../../../../../../shared/patient_age_determination.ts'
import { completedPersonal } from '../../../../../../../../shared/patient_registration.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { patient_evaluation_scores } from '../../../../../../../../db/models/patient_evaluation_scores.ts'
import { assertOr400 } from '../../../../../../../../util/assertOr.ts'
import matching from '../../../../../../../../util/matching.ts'

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

async function sharedVitalsDeterminations(ctx: OpenEncounterWorkflowContext) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const { trx, health_worker, patient, encounter } = ctx.state
  assert(completedPersonal(patient))

  const age_determination = patientAgeDetermination(patient)
  const patient_id = patient.id
  const { diabetes } = await renderedMostRecentFindings(
    trx,
    {
      patient_id,
      encounter,
      health_worker_id: health_worker.id,
      conditions: COMMON_CONDITIONS.filter((condition) =>
        condition.key === 'diabetes'
      ),
    },
  )

  const { measurements, assessments } = measureVitalsInputDefinitions({
    age_determination,
    has_diabetes: diabetes?.existence === 'Yes',
  })

  return { age_determination, measurements, assessments }
}

export const handler = postHandler(
  TriageMeasureVitalsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient,
      encounter: { patient_encounter_id },
      encounter_employee_presence: { patient_encounter_employee_id },
    } = ctx.state
    const patient_id = patient.id

    const {
      procedure: { procedure_id },
      shared: { age_determination, measurements, assessments },
      previous_vitals_this_encounter
    } = await promiseProps({
      procedure: createProcedureIfNotAlreadyCompleted(ctx),
      shared: sharedVitalsDeterminations(ctx),
      previous_vitals_this_encounter: patient_vitals
        .getMostRecent(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            patient_encounter_id: ctx.state.encounter.patient_encounter_id,
            health_worker_id: ctx.state.health_worker.id,
            snomed_concept_ids: Object.values(ALL_VITALS_SNOMED_CONCEPT_IDS),
          },
        )
    })

    // Assert all required measurements are present or were already measured this encounter
    for (const { vital, units, snomed_concept_id } of measurements) {
      const form_input = form_values.measurements[vital]
      if (form_input) {
        assertOr400(
          form_input.right.units === units,
          `Expected units to be ${units}. Received ${form_input.right.units}.`,
        )
        continue
      }

      const measured_previously = previous_vitals_this_encounter.some(matching({ finding_snomed_concept_id: snomed_concept_id }))
      assertOr400(
        measured_previously,
        `Missing required measurement: ${vital}`,
      )
    }

    // Assert all required assessments are present or were already measured this encounter
    for (const { vital, options, snomed_concept_id } of assessments) {
      const form_input = form_values.assessments[vital]
      if (form_input) {
        const option_snomed_concept_ids = options.map((o) => o.snomed_concept_id)
        assert(form_input.value_snomed_concept_id)
        assertOr400(
          option_snomed_concept_ids.includes(form_input.value_snomed_concept_id),
          `Expected value_snomed_concept_id to be one of ${option_snomed_concept_ids}. Received ${form_input.value_snomed_concept_id}.`,
        )
        continue
      }

      const assessed_previously = previous_vitals_this_encounter.some(matching({ finding_snomed_concept_id: snomed_concept_id }))
      assertOr400(
        assessed_previously,
        `Missing required assessment: ${vital}`,
      )
    }

    await Promise.all([
      forEach(
        entries(form_values.measurements),
        async ([vital, measurement_equality]) => {
          const result = await patient_measurements.insertOneNested(trx, {
            patient_id,
            patient_encounter_id,
            patient_encounter_employee_id,
            measurement_equality,
            procedure_id,
          })

          const score = getScoreForMeasurement(
            age_determination,
            vital,
            measurement_equality.right.value,
          )
          if (score != null) {
            await patient_evaluation_scores.insertOneNested(trx, {
              score,
              patient_id,
              patient_encounter_id,
              by_system: true,
              evaluates_record_id: result.measurement_id,
              evaluation: `(evaluation ${SEVERITY_SCORE_SNOMED_CONCEPT_ID})`,
            })
          }
        },
      ),
      forEach(
        entries(form_values.assessments),
        async ([vital, finding]) => {
          assert(finding.value_snomed_concept_id)

          const result = await patient_findings.insertOneNested(trx, {
            patient_id,
            patient_encounter_id,
            patient_encounter_employee_id,
            procedure_id,
            finding,
          })

          const score = getScoreForAssessment(
            age_determination,
            vital,
            finding.value_snomed_concept_id!,
          )
          if (score != null) {
            await patient_evaluation_scores.insertOneNested(trx, {
              score,
              patient_id,
              patient_encounter_id,
              by_system: true,
              evaluates_record_id: result.record_id,
              evaluation: `(evaluation ${SEVERITY_SCORE_SNOMED_CONCEPT_ID})`,
            })
          }
        },
      ),
    ])

    await insertTasksIfNotAlreadyIdentified(trx, {
      patient_id,
      patient_encounter_id,
    })

    return completeAndProceedToNextStep(ctx)
  },
)



export async function TriageMeasureVitalsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { measurements, assessments } = await sharedVitalsDeterminations(ctx)

  const most_recent_patient_vitals = await patient_vitals
    .getMostRecent(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        health_worker_id: ctx.state.health_worker.id,
        snomed_concept_ids: [
          ...measurements.map((m) => m.snomed_concept_id),
          ...assessments.map((m) => m.snomed_concept_id),
        ],
      },
    )

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={measurements}
      triage_assessments={assessments}
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageMeasureVitalsPage)
