import { LoggedInHealthWorkerHandler } from '../../../../../types.ts'
import * as patient_occupation from '../../../../../db/models/patient_occupations.ts'
import Occupation0_18 from '../../../../../islands/Occupation0-18.tsx'
import Occupation19 from '../../../../../islands/Occupation19.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons, {
  ButtonsContainer,
} from '../../../../../islands/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  assertAgeYearsKnown,
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import SlideoutMenu from '../../../../../islands/SlideoutMenu.tsx'

type OccupationFormValues = {
  // deno-lint-ignore no-explicit-any
  occupation: any
}

function assertIsOccupation(
  patient: unknown,
): asserts patient is OccupationFormValues {
  assertOr400(isObjectLike(patient))
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const patient = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsOccupation,
    )
    return upsertPatientAndRedirect(ctx, { occupation: patient.occupation })
  },
}

export default async function OccupationPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  const { patient, trx } = ctx.state
  const age_years = assertAgeYearsKnown(ctx)
  const OccupationForm = age_years <= 18 ? Occupation0_18 : Occupation19
  const occupation = await patient_occupation.get(trx, {
    patient_id: patient.id,
  })

  return (
    <IntakeLayout ctx={ctx}>
      <OccupationForm occupation={occupation} />
      <hr className='my-2' />
      <ButtonsContainer>
        <SlideoutMenu />
        <Button
          type='submit'
          className='flex-1 max-w-xl '
        >
          Next Step
        </Button>
      </ButtonsContainer>
    </IntakeLayout>
  )
}
