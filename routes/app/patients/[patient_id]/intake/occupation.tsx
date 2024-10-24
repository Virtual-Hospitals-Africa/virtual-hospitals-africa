import * as patient_occupation from '../../../../../db/models/patient_occupations.ts'
import Occupation0_18 from '../../../../../islands/Occupation0-18.tsx'
import Occupation19 from '../../../../../islands/Occupation19.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { assertAgeYearsKnown, IntakePage, postHandlerAsserts } from './_middleware.tsx'

type OccupationFormValues = {
  // deno-lint-ignore no-explicit-any
  occupation: any
}

function assertIsOccupation(
  patient: unknown,
): asserts patient is OccupationFormValues {
  assertOr400(isObjectLike(patient))
  patient.occupation = patient.occupation || {}
}

export const handler = postHandlerAsserts(
  assertIsOccupation,
  async function updateOccupation(ctx, patient_id, form_values) {
    await patient_occupation.upsert(
      ctx.state.trx,
      {
        patient_id,
        occupation: form_values.occupation,
      },
    )
  },
)

export default IntakePage(async function OccupationPage({ ctx, patient }) {
  const age_years = assertAgeYearsKnown(ctx)
  const OccupationForm = age_years <= 18 ? Occupation0_18 : Occupation19
  const occupation = await patient_occupation.get(ctx.state.trx, {
    patient_id: patient.id,
  })

  return <OccupationForm occupation={occupation} />
})
