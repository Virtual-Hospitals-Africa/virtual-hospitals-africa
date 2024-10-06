import PatientPersonalForm from '../../../../../islands/patient-intake/PersonalForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { IntakePage, postHandler } from './_middleware.tsx'
import * as patients from '../../../../../db/models/patients.ts'

type PersonalFormValues = {
  given_names: string[]
  family_name: string
  national_id_number?: string
  no_national_id: boolean
  phone_number?: string
  avatar_media_id?: string
  ethnicity?: string | string[]
}

function assertIsPersonal(
  patient: unknown,
): asserts patient is PersonalFormValues {
  console.log('assertIsPersonal', patient)
  assertOr400(isObjectLike(patient))

  assertOr400(!!patient.given_names && typeof patient.given_names === 'string')
  patient.given_names = patient.given_names.split(' ')

  assertOr400(!!patient.family_name && typeof patient.family_name === 'string')
  assertOr400(
    (!!patient.national_id_number &&
      typeof patient.national_id_number === 'string') ||
      patient.no_national_id,
  )
  delete patient.no_national_id
  if (typeof patient.national_id_number === 'string') {
    patient.national_id_number = patient.national_id_number.toUpperCase()
  }
  const avatar_media = patient.avatar_media
  delete patient.avatar_media
  if (avatar_media) {
    assertOr400(isObjectLike(avatar_media))
    patient.avatar_media_id = avatar_media.id
  }
}

export const handler = postHandler(
  assertIsPersonal,
  async function updatePersonal(
    ctx,
    patient_id,
    {
      given_names,
      family_name,
      national_id_number,
      avatar_media_id,
      phone_number,
      ethnicity,
    },
  ) {
    console.log('TODO handle ethnicity', ethnicity)
    await patients.update(ctx.state.trx, patient_id, {
      name: {
        given: given_names,
        family: family_name,
      },
      national_id_number,
      avatar_media_id,
      phone_number,
    })
  },
)

export default IntakePage(
  function PersonalPage({ patient, previously_completed }) {
    return (
      <PatientPersonalForm
        patient={patient}
        previously_completed={previously_completed}
      />
    )
  },
)
