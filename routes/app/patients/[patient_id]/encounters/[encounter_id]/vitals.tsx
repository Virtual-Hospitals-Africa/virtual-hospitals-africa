import { EncounterContext, EncounterPage } from './_middleware.tsx'
import { z } from 'zod'
import * as vitals from '../../../../../../db/models/vitals.ts'
import * as patient_findings from '../../../../../../db/models/patient_findings.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { completeStep } from './_middleware.tsx'
import { postHandler } from '../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../util/validators.ts'
import { filterOfType } from '../../../../../../util/assertAll.ts'
import { VitalsForm } from '../../../../../../components/vitals/Form.tsx'

const VitalsSchema = z.object({
  findings: z.record(
    z.string().uuid(),
    z.object({
      snomed_concept_id,
      value: z.number().positive().optional(),
      units: z.string(),
      severity: z.enum([
        'routine',
      ]).optional(),
      note: z.string().optional(),
    }),
  ).optional().transform((findings) =>
    Object.entries(findings || {}).map(([finding_id, finding]) => ({
      finding_id,
      ...finding,
      evaluation: finding.note
        ? { note: finding.note, priority: 'normal' }
        : null,
    }))
  ),
})

function hasValue(
  finding: { value?: number },
): finding is { value: number } {
  return typeof finding.value === 'number'
}

export const handler = postHandler(
  VitalsSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const completing_step = completeStep(ctx)

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await vitals.insertMeasurements(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      input_measurements: filterOfType(form_values.findings, hasValue),
    })

    return completing_step
  },
)

export async function VitalsPage(ctx: EncounterContext) {
  const vital_measurements_for_this_encounter = await vitals
    .measurementsNeededForEncounter(
      ctx.state.trx,
      ctx.state.patient,
    )

  const most_recent_patient_vitals = await patient_findings
    .getMostRecentMeasurements(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: vital_measurements_for_this_encounter.map((o) =>
          o.snomed_concept_id
        ),
      },
    )

  return (
    <VitalsForm
      vital_measurements_for_this_encounter={vital_measurements_for_this_encounter}
      most_recent_patient_vitals={most_recent_patient_vitals}
    />
  )
}

export default EncounterPage(VitalsPage)
