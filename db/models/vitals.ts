import { TrxOrDb, VitalObservationFormInputDefition } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

// TODO
type PatientRecord = unknown

// deno-lint-ignore require-await
export async function observationsNeededForEncounter(
  _trx: TrxOrDb,
  _patient_record: PatientRecord,
): Promise<VitalObservationFormInputDefition[]> {
  // Returning just adult values for now
  return [
    {
      observation_id: generateUUID(),
      snomed_concept_id: '1153637007',
      required: true,
      label: 'height',
      units: 'cm',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '726527001',
      required: true,
      label: 'weight',
      units: 'kg',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '722490005',
      required: true,
      label: 'temperature',
      units: '°C',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '271650006',
      required: true,
      label: 'blood_pressure_diastolic',
      units: 'mmHg',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '271649006',
      required: true,
      label: 'blood_pressure_systolic',
      units: 'mmHg',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '103228002',
      required: true,
      label: 'blood_oxygen_saturation',
      units: '%',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '405176005',
      required: true,
      label: 'blood_glucose',
      units: 'mg/dL',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '8499008',
      required: true,
      label: 'pulse',
      units: 'bpm',
    },
    {
      observation_id: generateUUID(),
      snomed_concept_id: '86290005',
      required: true,
      label: 'respiratory_rate',
      units: 'bpm',
    },
  ]
}
