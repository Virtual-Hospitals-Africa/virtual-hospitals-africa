import { PageProps } from '$fresh/server.ts'
import { AddPatientStep } from '../../../patients/add/Steps.tsx'
import { Steps } from '../../../library/Steps.tsx'
import { NurseSpeciality, ReturnedSqlRow, TrxOrDb } from '../../../../types.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import isObjectLike from '../../../../util/isObjectLike.ts'
import { Maybe } from '../../../../types.ts'
import { Media } from '../../../../types.ts'

export type NurseRegistrationStep =
  | 'personal'
  | 'professional'
  | 'document'

export const NurseRegistrationStepNames = [
  'personal',
  'professional',
  'document',
]

export function isNurseRegistrationStep(
  step: string | null,
): step is AddPatientStep {
  if (step === null) {
    return false
  }
  return NurseRegistrationStepNames.includes(step)
}

export function useNurseRegistrationSteps(props: PageProps) {
  const stepQuery = props.url.searchParams.get('step')
  const currentStep = isNurseRegistrationStep(stepQuery)
    ? stepQuery
    : NurseRegistrationStepNames[0]

  let completed = false

  const steps = NurseRegistrationStepNames.map((name) => {
    if (name === currentStep) {
      completed = true
      return { name, status: 'current' as const }
    }
    if (completed) {
      return { name, status: 'upcoming' as const }
    }
    return { name, status: 'complete' as const }
  })

  return {
    currentStep,
    stepsTopBar: <Steps url={props.url} steps={steps} />,
    steps,
  }
}

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
      return parseRequest(trx, req, isDocumentFormFields)
    default:
      throw new Error('No step found')
  }
}

export type DocumentFormFields = {
  national_id_picture: Maybe<ReturnedSqlRow<Media>>
  ncz_registration_card: Maybe<ReturnedSqlRow<Media>>
  face_picture: Maybe<ReturnedSqlRow<Media>>
}

export type PersonalFormFields = {
  first_name: string
  middle_names?: string
  last_name: string
  gender: 'male' | 'female' | 'other'
  national_id: string
  email: string
  mobile_number: string
}

export type ProfessionalInformationFields = {
  speciality: NurseSpeciality
  date_of_first_practice: Date
  ncz_registration_number: string
}

function isPersonalFormFields(
  fields: unknown,
): fields is PersonalFormFields {
  return isObjectLike(fields) &&
    !!fields.first_name &&
    !!fields.last_name &&
    !!fields.gender &&
    !!fields.national_id &&
    !!fields.email &&
    !!fields.mobile_number
}

function isProfessionalInformationFields(
  fields: unknown,
): fields is ProfessionalInformationFields {
  console.log(fields)
  return isObjectLike(fields) &&
    !!fields.speciality &&
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

function isDocumentFormFields(
  fields: unknown,
): fields is DocumentFormFields {
  return isObjectLike(fields) &&
    !!isMedia(fields.national_id_picture) &&
    !!isMedia(fields.ncz_registration_card) &&
    !!isMedia(fields.face_picture)
}
