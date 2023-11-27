import { useSteps } from '../../../library/Steps.tsx'
import { NurseSpecialty, ReturnedSqlRow, TrxOrDb } from '../../../../types.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import { Maybe } from '../../../../types.ts'
import { Media } from '../../../../types.ts'

export type NurseRegistrationStep =
  | 'personal'
  | 'professional'
  | 'documents'

export const NurseRegistrationStepNames: NurseRegistrationStep[] = [
  'personal',
  'professional',
  'documents',
]

export const useNurseRegistrationSteps = useSteps(NurseRegistrationStepNames)

export function getStepFormData(
  currentStep: string,
  trx: TrxOrDb,
  req: Request,
) {
  switch (currentStep) {
    case NurseRegistrationStepNames[0]:
      return parseRequest(trx, req, isPersonalFormFields)
    case NurseRegistrationStepNames[1]:
      return parseRequest(trx, req, isProfessionalInformationFields)
    case NurseRegistrationStepNames[2]:
      return parseRequest(trx, req, isDocumentsFormFields)
    default:
      throw new Error('No step found')
  }
}

export type DocumentFormFields = {
  national_id_picture: Maybe<ReturnedSqlRow<Media>>
  ncz_registration_card: Maybe<ReturnedSqlRow<Media>>
  face_picture: Maybe<ReturnedSqlRow<Media>>
  nurse_practicing_cert: Maybe<ReturnedSqlRow<Media>>
}

export type PersonalFormFields = {
  first_name: string
  middle_names?: string
  last_name: string
  gender: 'male' | 'female' | 'other'
  date_of_birth: string
  national_id_number: string
  email: string
  mobile_number: string
  street: string
  suburb_id: number
  ward_id: number
  district_id: number
  province_id: number
  country_id: number
}

export type ProfessionalInformationFields = {
  specialty: NurseSpecialty
  date_of_first_practice: string
  ncz_registration_number: string
}

function isPersonalFormFields(
  fields: unknown,
): fields is PersonalFormFields {
  return isObjectLike(fields) &&
    !!fields.first_name &&
    !!fields.last_name &&
    !!fields.gender &&
    !!fields.national_id_number &&
    !!fields.mobile_number &&
    !!fields.street &&
    !!fields.ward_id &&
    !!fields.district_id &&
    !!fields.province_id &&
    !!fields.country_id
}

function isProfessionalInformationFields(
  fields: unknown,
): fields is ProfessionalInformationFields {
  return isObjectLike(fields) &&
    !!fields.specialty &&
    !!fields.date_of_first_practice &&
    !!fields.ncz_registration_number
}

function isMedia(
  media: unknown,
): media is Maybe<Media> {
  return isObjectLike(media) &&
      !!media.mime_type &&
      !!media.binary_data &&
      !!media.id ||
    media === undefined
}

function isDocumentsFormFields(
  fields: unknown,
): fields is DocumentFormFields {
  return isObjectLike(fields) &&
    (isMedia(fields.national_id_picture) ||
      fields.national_id_picture === '') &&
    (isMedia(fields.ncz_registration_card) ||
      fields.ncz_registration_card === '') &&
    (isMedia(fields.face_picture) || fields.face_picture === '') &&
    (isMedia(fields.nurse_practicing_cert) ||
      fields.nurse_practicing_cert === '')
}
