import { EncounterContext, EncounterLayout } from './_middleware.tsx'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import { getYears } from '../../../../../../db/models/patient_age.ts'
import {
  LoggedInHealthWorkerHandler,
  MeasurementsUpsert,
} from '../../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import { completeStep } from './_middleware.tsx'
import { VitalsForm } from '../../../../../../islands/vitals/Form.tsx'
import { MEASUREMENTS } from '../../../../../../shared/measurements.ts'
import { assert } from 'std/assert/assert.ts'

function assertIsVitals(
  values: unknown,
): asserts values is {
  measurements: MeasurementsUpsert
} {
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
      assertIsVitals,
    )
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

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

export default async function VitalsPage(_req: Request, ctx: EncounterContext) {
  const vitals = await patient_measurements.getEncounterVitals(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  return (
    <EncounterLayout ctx={ctx}>
      <VitalsForm vitals={vitals} />
      <FormButtons />
    </EncounterLayout>
  )
}
