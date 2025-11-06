import { assert } from 'std/assert/assert.ts'
import {
  RenderedPatient,
  RenderedPatientCompletedRegistration,
} from '../types.ts'

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
  assert(patient.sex)
  assert(patient.gender)
  assert(patient.date_of_birth)
  return true
}
