import {
  RenderedPatient,
  RenderedPatientCompletedPersonal,
  RenderedPatientCompletedRegistration,
} from '../types.ts'
import { assertPropertyNonNull } from '../util/assertPropertyNonNull.ts'

export const PATIENT_REGISTRATION_STEPS = [
  'personal' as const,
  'this_visit' as const,
  'primary_care' as const,
  'contacts' as const,
  'biometrics' as const,
]

export type PatientRegistrationStep =
  (typeof PATIENT_REGISTRATION_STEPS)[number]

export function isPatientRegistrationStep(
  step: string | undefined,
): step is PatientRegistrationStep {
  return PATIENT_REGISTRATION_STEPS.includes(
    step as unknown as PatientRegistrationStep,
  )
}

export function completedRegistration(
  patient: RenderedPatient,
): patient is RenderedPatientCompletedRegistration {
  if (!patient.completed_registration) {
    return false
  }
  assertPropertyNonNull(patient, 'sex')
  assertPropertyNonNull(patient, 'gender')
  assertPropertyNonNull(patient, 'date_of_birth')
  return true
}

export function completedPersonal(
  patient: RenderedPatient,
): patient is RenderedPatientCompletedPersonal {
  return !!patient.sex && !!patient.gender && !!patient.date_of_birth
}
