import { useSteps } from '../../../library/Steps.tsx'
import { NurseSpecialty, TrxOrDb } from '../../../../types.ts'
import { parseRequestAsserts } from '../../../../util/parseForm.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import { Maybe } from '../../../../types.ts'
import { Media } from '../../../../types.ts'
import { assertOr400 } from '../../../../util/assertOr.ts'

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
      return parseRequestAsserts(trx, req, assertIsPersonalFormFields)
    case NurseRegistrationStepNames[1]:
      return parseRequestAsserts(
        trx,
        req,
        assertIsProfessionalInformationFields,
      )
    case NurseRegistrationStepNames[2]:
      return parseRequestAsserts(trx, req, assertIsDocumentsFormFields)
    default:
      throw new Error('No step found')
  }
}

export type DocumentFormFields = {
  national_id_picture: Maybe<{ id: number; url: string }>
  ncz_registration_card: Maybe<{ id: number; url: string }>
  face_picture: Maybe<{ id: number; url: string }>
  nurse_practicing_cert: Maybe<{ id: number; url: string }>
}

export type PersonalFormFields = {
  first_name: string
  middle_names?: string
  last_name: string
  gender: 'male' | 'female' | 'non-binary'
  date_of_birth: string
  national_id_number: string
  email: string
  mobile_number: string
  address: {
    street: string
    suburb_id: number
    ward_id: number
    district_id: number
    province_id: number
    country_id: number
  }
}

export type ProfessionalInformationFields = {
  specialty: NurseSpecialty
  date_of_first_practice: string
  ncz_registration_number: string
}

function assertIsPersonalFormFields(
  fields: unknown,
): asserts fields is PersonalFormFields {
  assertOr400(isObjectLike(fields))
  assertOr400(!!fields.first_name)
  assertOr400(!!fields.last_name)
  assertOr400(!!fields.gender)
  assertOr400(!!fields.national_id_number)
  assertOr400(!!fields.mobile_number)
  assertOr400(isObjectLike(fields.address))
  assertOr400(!!fields.address.country_id)
  assertOr400(!!fields.address.province_id)
  assertOr400(!!fields.address.district_id)
  assertOr400(!!fields.address.ward_id)
}

function assertIsProfessionalInformationFields(
  fields: unknown,
): asserts fields is ProfessionalInformationFields {
  assertOr400(isObjectLike(fields))
  assertOr400(!!fields.specialty)
  assertOr400(!!fields.date_of_first_practice)
  assertOr400(!!fields.ncz_registration_number)
}

function assertIsMedia(
  media: unknown,
): asserts media is Media | null | undefined | '' {
  if (media == null || media === '') return
  assertOr400(isObjectLike(media))
  assertOr400(!!media.mime_type)
  assertOr400(!!media.binary_data)
  assertOr400(!!media.id)
}

function assertIsDocumentsFormFields(
  fields: unknown,
): asserts fields is DocumentFormFields {
  assertOr400(isObjectLike(fields))
  assertIsMedia(fields.national_id_picture)
  assertIsMedia(fields.ncz_registration_card)
  assertIsMedia(fields.face_picture)
  assertIsMedia(fields.nurse_practicing_cert)
}
