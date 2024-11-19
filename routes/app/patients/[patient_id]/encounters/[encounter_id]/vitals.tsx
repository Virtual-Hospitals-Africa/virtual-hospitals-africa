import {
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { z } from 'zod'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import {
  LoggedInHealthWorkerHandler,
  MeasurementsUpsert,
} from '../../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { completeStep } from './_middleware.tsx'
import { VitalsForm } from '../../../../../../islands/vitals/Form.tsx'
import { MEASUREMENTS } from '../../../../../../shared/measurements.ts'

const VitalUpsertSchema = z.object({
  measurement_name: z.string(),
  value: z.number(),
  is_flagged: z.boolean(),
})

const VitalsMeasurementsSchema = z.object({
  vitals: z.array(VitalUpsertSchema).optional(),
})

function assertIsVitals(
  values: unknown,
): asserts values is {
  measurements: MeasurementsUpsert
} {
  console.log('values in vitals', values)

  assertOr400(isObjectLike(values), 'Invalid form values')
  if (values.no_vitals_required) return
  assertOr400(isObjectLike(values.measurements), 'Invalid form values')
  for (
    const [measurement_name, measurement] of Object.entries(values.measurements)
  ) {
    assertOr400(
      // deno-lint-ignore no-explicit-any
      (MEASUREMENTS as any)[measurement_name],
      `${measurement_name} is not a valid measurement`,
    )
    assertOr400(
      typeof measurement === 'number',
      `${measurement_name} must be a number`,
    )
  }
}

export const handler: LoggedInHealthWorkerHandler<EncounterContext> = {
  async POST(req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)

    const { measurements } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      // assertIsVitals,
      VitalsMeasurementsSchema.parse,
    )
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_measurements.upsertVitals(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      measurements: measurements || {},
    })

    return completing_step
  },
}

export async function VitalsPage({ ctx }: EncounterPageChildProps) {
  const vitals = await patient_measurements.getEncounterVitals(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  return <VitalsForm vitals={vitals} />
}

export default EncounterPage(VitalsPage)
