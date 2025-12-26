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
import { positive_number } from '../../../../../../../../util/validators.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS } from '../../../../../../../../shared/vitals.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'
import { pMap } from '../../../../../../../../util/inParallel.ts'
import entries from '../../../../../../../../util/entries.ts'
import { assert } from 'std/assert/assert.ts'
import fromEntries from '../../../../../../../../util/fromEntries.ts'
import { patient_vitals } from '../../../../../../../../db/models/patient_vitals.ts'

const TriageHeightAndWeightSchema = z.object({
  measurements: z.record(
    z.enum(['height', 'weight']),
    z.object({
      value: positive_number,
      units: z.string().min(1),
    }).strict(),
  ).transform((measurements) =>
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
}).strict()

export const handler = postHandler(
  TriageHeightAndWeightSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)

    await pMap(
      entries(form_values.measurements),
      ([/* vital */, measurement_equality]) =>
        patient_measurements.insertOneNested(ctx.state.trx, {
          procedure_id,
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          patient_encounter_employee_id:
            ctx.state.encounter_employee_presence.patient_encounter_employee_id,
          measurement_equality,
        }),
    )

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageHeightAndWeightPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const most_recent_patient_vitals = await patient_vitals
    .getMostRecent(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: [
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height,
          VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight,
        ],
      },
    )

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={[
        {
          vital: 'height',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.height,
          required: true,
          units: 'cm',
        },
        {
          vital: 'weight',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS.weight,
          required: true,
          units: 'kg',
        },
      ]}
      triage_assessments={[]}
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageHeightAndWeightPage)
