//define every steps of patient information intake process
export const PATIENT_INTAKE_STEPS = [
  //personal information
  'personal' as const,
  //reason for visit page
  'this_visit' as const,
  //who is doctor?what is the diagonosis?primary care?
  'primary_care' as const,
  //contact information
  'contacts' as const,
  //concent/ scanner/ capture finguerprint....
  'biometrics' as const,
]

//PatientIntakeStep can only be one of
//'personal' | 'this_visit' | 'primary_care' | 'contacts' | 'biometrics'
// number = 0 | 1 | 2 | 3 | 4
export type PatientIntakeStep = (typeof PATIENT_INTAKE_STEPS)[number]

//check the type of step, additionally define step as PatientIntakeStep
export function isPatientIntakeStep(
  step: string | undefined,
): step is PatientIntakeStep {
  //if this sentence return true, then step is PatientIntakeStep(Type Guard)
  //includes(x) is a method of array to check if x is one of the elements in the array
  //includes(x) limits the type of x, therefore, step needs to be transformed to PatientIntakeStep
  //(A as known unknown as type1) force to transform the type of A twice
  //unknown type can be allowed to be transformed to any type
  return PATIENT_INTAKE_STEPS.includes(step as unknown as PatientIntakeStep)
}
