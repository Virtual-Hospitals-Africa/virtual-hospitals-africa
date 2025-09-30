export const PATIENT_TRIAGE_STEPS = [
  'chief_complaint' as const,
  'emergency_signs' as const,
  'urgent_signs' as const,
  'vital_measurements' as const,
  'confirm_triage_level' as const,
]

export type PatientTriageStep = (typeof PATIENT_TRIAGE_STEPS)[number]

export function isPatientTriageStep(
  step: string | undefined,
): step is PatientTriageStep {
  return PATIENT_TRIAGE_STEPS.includes(step as unknown as PatientTriageStep)
}

export const TRIAGE_PROCEDURE_SNOMED_CONCEPT_ID = '225390008'
