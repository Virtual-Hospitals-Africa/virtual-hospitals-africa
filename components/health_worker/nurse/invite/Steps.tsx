import { z } from 'zod'
import { useSteps } from '../../../library/Steps.tsx'
import { NurseSpecialty, TrxOrDb } from '../../../../types.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import { Maybe } from '../../../../types.ts'
import {
  gender,
  national_id_number,
  phone_number,
} from '../../../../util/validators.ts'

export type NurseRegistrationStep =
  | 'personal'
  | 'professional'
  | 'documents'

export const NurseRegistrationStepNames: NurseRegistrationStep[] = [
  'personal' as const,
  'professional' as const,
  'documents' as const,
]

export const useNurseRegistrationSteps = useSteps(NurseRegistrationStepNames)

export function getStepFormData(
  currentStep: string,
  trx: TrxOrDb,
  req: Request,
) {
  switch (currentStep) {
    case NurseRegistrationStepNames[0]:
      return parseRequest(trx, req, PersonalFormFields.parse)
    case NurseRegistrationStepNames[1]:
      return parseRequest(
        trx,
        req,
        ProfessionalInformationFields.parse,
      )
    case NurseRegistrationStepNames[2]:
      return parseRequest(trx, req, DocumentsFormFields.parse)
    default:
      throw new Error('No step found')
  }
}

export type DocumentFormFields = {
  national_id_picture: Maybe<{ id: string; url: string }>
  ncz_registration_card: Maybe<{ id: string; url: string }>
  face_picture: Maybe<{ id: string; url: string }>
  nurse_practicing_cert: Maybe<{ id: string; url: string }>
}

export type ProfessionalInformationFields = {
  specialty: NurseSpecialty
  date_of_first_practice: string
  ncz_registration_number: string
}

export const PersonalFormFields = z.object({
  first_name: z.string(),
  middle_names: z.optional(z.string()),
  last_name: z.string(),
  date_of_birth: z.string().date(),
  email: z.optional(z.string()).refine(
    (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    {
      message: 'Invalid email format',
    },
  ),
  gender,
  national_id_number,
  mobile_number: z.optional(phone_number),
  address: z.object({
    country: z.string(),
    administrative_area_level_1: z.string(),
    administrative_area_level_2: z.string(),
    locality: z.string(),
    street: z.string(),
  }),
})
export type PersonalFormFields = z.infer<typeof PersonalFormFields>

const ProfessionalInformationFields = z.object({
  specialty: z.enum([
    'primary care',
    'registered general',
    'midwife',
    'intensive and coronary care',
    'renal',
    'neonatal intensive care and paediatric',
    'psychiatric mental health',
    'operating theatre',
    'community',
    'opthalmic',
    'anaesthetist',
    'trauma care',
    'clinical care',
    'clinical officer',
    'orthopaedic',
    'oncology and palliative care',
    'dental',
  ]),
  date_of_first_practice: z.string().date(),
  ncz_registration_number: z.string(),
})

const Media = z.object({
  mime_type: z.string(),
  binary_data: z.string(),
  id: z.string(),
})

const DocumentsFormFields = z.object({
  national_id_picture: z.optional(Media),
  ncz_registration_card: z.optional(Media),
  face_picture: z.optional(Media),
  nurse_practicing_cert: z.optional(Media),
})
