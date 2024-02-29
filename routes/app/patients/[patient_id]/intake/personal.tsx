import { LoggedInHealthWorkerHandler, Maybe } from '../../../../../types.ts'
import PatientPersonalForm from '../../../../../components/patients/intake/PersonalForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import {
  IntakeContext,
  IntakeLayout,
  upsertPatientAndRedirect,
} from './_middleware.tsx'
import { assert } from 'std/assert/assert.ts'
import omit from '../../../../../util/omit.ts'

type PersonalFormValues = {
  first_name: string
  last_name: string
  middle_names?: string
  avatar_media?: Maybe<{ id: number }>
  national_id_number?: string
  no_national_id: boolean
  phone_number?: string
}

function assertIsPersonal(
  patient: unknown,
): asserts patient is PersonalFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(!!patient.first_name && typeof patient.first_name === 'string')
  assertOr400(!!patient.last_name && typeof patient.last_name === 'string')
  assertOr400(
    (!!patient.national_id_number &&
      typeof patient.national_id_number === 'string') ||
      patient.no_national_id,
  )
}

export const handler: LoggedInHealthWorkerHandler<IntakeContext> = {
  async POST(req, ctx) {
    const { avatar_media, national_id_number, ...patient } =
      await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertIsPersonal,
      )
    return upsertPatientAndRedirect(ctx, {
      ...omit(patient, ['no_national_id']),
      national_id_number: national_id_number
        ? national_id_number.toUpperCase()
        : null,
      avatar_media_id: avatar_media?.id,
    })
  },
}

// deno-lint-ignore require-await
export default async function PersonalPage(
  _req: Request,
  ctx: IntakeContext,
) {
  const { is_review, patient } = ctx.state
  assert(!is_review)
  const previously_filled = patient.intake_steps_completed.includes(
    'personal',
  )
  return (
    <IntakeLayout ctx={ctx}>
      <PatientPersonalForm
        patient={patient}
        previously_filled={previously_filled}
      />
      <hr className='my-2' />
      <Buttons submitText='Next Step' />
    </IntakeLayout>
  )
}
