import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import {
  RenderedPatient,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { completedPersonal } from '../../shared/patient_registration.ts'

export async function measurementsNeededForTriageEncounter(
  trx: TrxOrDb,
  patient_record: RenderedPatient,
  active_condition_snomed_codes: readonly string[],
): Promise<VitalMeasurementFormInputDefition[]> {
  // Get regular vital measurements based on clinical context
  // AVPU/Mobility/Trauma are now handled by database-driven categorical assessments

  assert(completedPersonal(patient_record))

  const requirements_result = await clinical_measurement_requirements
    .determineMeasurementsForPatient(trx, {
      patient_id: patient_record.id,
      age_days: patient_record.age_days ?? 0,
      sex: patient_record.sex,
      active_condition_snomed_codes,
      pregnancy_status: active_condition_snomed_codes.includes('77386006'),
    })

  return requirements_result.measurements
}
