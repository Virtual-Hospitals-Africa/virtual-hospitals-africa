import { EncounterContext, EncounterPage } from './../_middleware.tsx'
import { z } from 'zod'
import * as vitals from '../../../../../../../db/models/vitals.ts'
import * as patient_measurements from '../../../../../../../db/models/patient_measurements.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../../util/validators.ts'
import filterOfType from '../../../../../../../util/filterOfType.ts'
import { VitalsMeasurementsForm } from '../../../../../../../components/vitals/MeasurementsForm.tsx'
import redirect from '../../../../../../../util/redirect.ts'

const VitalsMeasurementSchema = z.object({
  findings: z.record(
    z.string().uuid(),
    z.object({
      snomed_concept_id,
      value: z.number().positive().optional(),
      units: z.string().min(1, 'Units are required'),
    }).strict(),
  ).optional().transform((findings) =>
    Object.entries(findings || {}).map((
      [finding_id, finding],
    ) => ({
      finding_id,
      ...finding,
      evaluation: null,
    }))
  ),
}).strict()

function hasValue(
  finding: { value?: number },
): finding is { value: number } {
  return typeof finding.value === 'number' && finding.value > 0
}

export const handler = postHandler(
  VitalsMeasurementSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const input_measurements = filterOfType(form_values.findings, hasValue)

    if (input_measurements.length) {
      const manual_insertion_result = await vitals.insertMeasurements(
        ctx.state.trx,
        {
          patient_id,
          encounter_id: ctx.state.encounter.encounter_id,
          encounter_provider_id:
            ctx.state.encounter_provider.patient_encounter_provider_id,
          input_measurements,
        },
      )

      await vitals.computeAndInsertDerivedMeasurements(
        ctx.state.trx,
        {
          patient_id,
          encounter_id: ctx.state.encounter.encounter_id,
          encounter_provider_id:
            ctx.state.encounter_provider.patient_encounter_provider_id,
          source_measurements: input_measurements,
          source_procedure_id: manual_insertion_result.procedure_id,
        },
      )
    }

    const url = new URL(ctx.url)
    url.pathname = url.pathname.replace('/measurements', '/evaluations')
    return redirect(url)
  },
)

export async function VitalsMeasurementsPage(ctx: EncounterContext) {
  const vital_measurements_for_this_encounter = await vitals
    .measurementsNeededForEncounter(
      ctx.state.trx,
      ctx.state.patient,
    )

  const most_recent_patient_vitals = await patient_measurements
    .getMostRecent(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: vital_measurements_for_this_encounter.map((o) =>
          o.snomed_concept_id
        ),
      },
    )

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={vital_measurements_for_this_encounter}
      most_recent_patient_vitals={most_recent_patient_vitals}
    />
  )
}

export default EncounterPage(VitalsMeasurementsPage)
