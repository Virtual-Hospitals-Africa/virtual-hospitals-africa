import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import redirect from '../../../../../util/redirect.ts'
import PatientPersonalForm from '../../../../../components/patients/intake/PersonalForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { IntakeContext, IntakeLayout, nextLink } from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'

type PersonalFormValues = {
  first_name: string
  last_name: string
  middle_names?: string
  avatar_media?: Maybe<{ id: number }>
  national_id_number: string
  phone_number?: string
}

function assertIsPersonal(
  patient: unknown,
): asserts patient is PersonalFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(!!patient.first_name && typeof patient.first_name === 'string')
  assertOr400(!!patient.last_name && typeof patient.last_name === 'string')
  assertOr400(!!patient.national_id_number)
  assertOr400(typeof patient.national_id_number === 'string')
}

export const handler: LoggedInHealthWorkerHandler = {
  async POST(req, ctx) {
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const { avatar_media, ...patient } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsPersonal,
    )
    await patients.upsertIntake(ctx.state.trx, {
      ...patient,
      id: patient_id,
      avatar_media_id: avatar_media?.id,
    })

    return redirect(nextLink(ctx))
  },
}

// deno-lint-ignore require-await
export default async function PersonalPage(
  _req: Request,
  ctx: IntakeContext,
) {
  assert(!ctx.state.is_review)
  return (
    <IntakeLayout ctx={ctx}>
      <PatientPersonalForm patient={ctx.state.patient} />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
