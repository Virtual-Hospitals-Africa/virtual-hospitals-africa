export const PATIENT_INTAKE_STEPS = [
  'personal' as const,
  'this_visit' as const,
  'primary_care' as const,
  'contacts' as const,
  'biometrics' as const,
]

export type PatientIntakeStep = (typeof PATIENT_INTAKE_STEPS)[number]

export function isPatientIntakeStep(
  step: string | undefined,
): step is PatientIntakeStep {
  return PATIENT_INTAKE_STEPS.includes(step as unknown as PatientIntakeStep)
}
