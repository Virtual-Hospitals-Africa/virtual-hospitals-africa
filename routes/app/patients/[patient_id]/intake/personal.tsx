import { Maybe } from '../../../../../types.ts'
import PatientPersonalForm from '../../../../../islands/patient-intake/PersonalForm.tsx'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { IntakePage, postHandler } from './_middleware.tsx'

type PersonalFormValues = {
  first_name: string
  last_name: string
  middle_names?: string
  avatar_media?: Maybe<{ id: string }>
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

export const handler = postHandler(assertIsPersonal)

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
