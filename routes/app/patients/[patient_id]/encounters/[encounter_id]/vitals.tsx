import { EncounterContext, EncounterPage } from './_middleware.tsx'
import { z } from 'zod'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import * as vitals from '../../../../../../db/models/vitals.ts'
import * as patient_observations from '../../../../../../db/models/patient_observations.ts'

import {
  MeasurementsUpsert,
} from '../../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { completeStep } from './_middleware.tsx'
import { VitalsForm } from '../../../../../../islands/vitals/Form.tsx'
import { postHandler } from '../../../../../../util/postHandler.ts'
import { snomed_concept_id } from '../../../../../../util/validators.ts'
import { filterOfType } from '../../../../../../util/assertAll.ts'

const VitalsSchema = z.object({
  observations: z.record(z.string().uuid(), z.object({
    snomed_concept_id,
    value: z.number().positive().optional(),
    units: z.string(),
    severity: z.enum([
      'routine',
    ]).optional(),
    note: z.string().optional(),
  })).optional().transform(observations => Object.entries(observations || {}).map(([observation_id, observation]) => (
    { observation_id, ...observation }
  )))
})

function hasValue(observation: { value?: number }): observation is { value: number } {
  return typeof observation.value === 'number'
}

export const handler = postHandler(
  VitalsSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const completing_step = completeStep(ctx)

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

// .transform(observations => observations)

    await patient_observations.insertMeasurements(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      input_measurements: filterOfType(form_values.observations, hasValue),
    })

    return completing_step
  },
)

// export const handler: LoggedInHealthWorkerHandler<EncounterContext> = {
//   async POST(req, ctx: EncounterContext) {
//     const completing_step = completeStep(ctx)

//     const { measurements } = await parseRequest(
//       ctx.state.trx,
//       req,
//       VitalsMeasurementsSchema.parse,
//     )

//     const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

//     await patient_measurements.upsertVitals(ctx.state.trx, {
//       patient_id,
//       encounter_id: ctx.state.encounter.encounter_id,
//       encounter_provider_id:
//         ctx.state.encounter_provider.patient_encounter_provider_id,
//       input_measurements: measurements,
//     })

//     return completing_step
//   },
// }

export async function VitalsPage(ctx: EncounterContext) {
  const vital_observations_for_this_encounter = await vitals.observationsNeededForEncounter(
    ctx.state.trx,
    ctx.state.patient
  )

  const most_recent_patient_vitals = await patient_observations.getMostRecent(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    snomed_concept_ids: vital_observations_for_this_encounter.map(o => o.snomed_concept_id)
  })

  return (
    <VitalsForm 
      vital_observations_for_this_encounter={vital_observations_for_this_encounter} 
      most_recent_patient_vitals={most_recent_patient_vitals} 
      />
  )
}

export default EncounterPage(VitalsPage)
