import * as patient_findings from './patient_findings.ts'
import {
  Measurement,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

// TODO
type PatientRecord = unknown

const TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE = '61746007'

export function insertMeasurements(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    input_measurements: Measurement[]
  },
): Promise<{ success: true }> {
  return patient_findings.insertMeasurements(trx, {
    ...opts,
    procedure: {
      create_from_snomed_concept_id: TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE,
    },
  })
}

// deno-lint-ignore require-await
export async function measurementsNeededForEncounter(
  _trx: TrxOrDb,
  _patient_record: PatientRecord,
): Promise<VitalMeasurementFormInputDefition[]> {
  // Returning just adult values for now
  return [
    {
      finding_id: generateUUID(),
      snomed_concept_id: '1153637007',
      required: true,
      label: 'height',
      units: 'cm',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '726527001',
      required: true,
      label: 'weight',
      units: 'kg',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '722490005',
      required: true,
      label: 'temperature',
      units: '°C',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '271650006',
      required: true,
      label: 'blood_pressure_diastolic',
      units: 'mmHg',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '271649006',
      required: true,
      label: 'blood_pressure_systolic',
      units: 'mmHg',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '103228002',
      required: true,
      label: 'blood_oxygen_saturation',
      units: '%',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '405176005',
      required: true,
      label: 'blood_glucose',
      units: 'mg/dL',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '8499008',
      required: true,
      label: 'pulse',
      units: 'bpm',
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: '86290005',
      required: true,
      label: 'respiratory_rate',
      units: 'bpm',
    },
  ]
}
