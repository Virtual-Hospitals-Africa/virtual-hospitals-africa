import { assert } from 'std/assert/assert.ts'
import { AgeDetermination, RenderedPatientCompletedPersonal } from '../types.ts'

export function patientAgeDetermination(
  patient: RenderedPatientCompletedPersonal,
): AgeDetermination {
  assert(typeof patient.age_years === 'number')
  assert(patient.age_years >= 0)
  assert(patient.most_recent_height_cm_measurement != null)

  const height_cm = parseFloat(patient.most_recent_height_cm_measurement)

  if (height_cm >= 150) {
    return 'adult'
  }

  if (patient.age_years >= 12) return 'adult'

  if (height_cm >= 95) {
    return 'older child'
  }
  if (patient.age_years >= 3) return 'older child'

  return 'younger child'
}
