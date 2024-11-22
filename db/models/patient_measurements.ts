import { MEASUREMENTS } from '../../shared/measurements.ts'
import {
  Measurement,
  Measurements,
  MeasurementsUpsert,
  PatientMeasurement,
  TrxOrDb,
} from '../../types.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'

export async function upsertVitals(
  trx: TrxOrDb,
  { input_measurements, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    input_measurements: MeasurementsUpsert[]
  },
) {
  console.log('input_measurements', input_measurements)
  const unseen_vitals = new Set(Object.keys(MEASUREMENTS))

  const patient_measurements: PatientMeasurement[] = input_measurements.map(
    (input_measurement) => {
      unseen_vitals.delete(input_measurement.measurement_name)
      return {
        patient_id,
        encounter_id,
        encounter_provider_id,
        measurement_name: input_measurement
          .measurement_name as keyof Measurements,
        is_flagged: input_measurement.is_flagged,
        value: input_measurement.value!,
      }
    },
  )

  const removing_vitals = trx.deleteFrom('patient_measurements')
    .where('patient_id', '=', patient_id)
    .where('encounter_id', '=', encounter_id)
    .where('measurement_name', 'in', [...unseen_vitals])
    .execute()

  const updating_vitals = patient_measurements.length && trx
    .insertInto('patient_measurements')
    .values(patient_measurements)
    .onConflict((oc) =>
      oc.constraint('one_measurement_per_encounter').doUpdateSet((eb) => ({
        value: eb.ref('excluded.value'),
      }))
    )
    .execute()

  await Promise.all([removing_vitals, updating_vitals])
}

export async function getEncounterVitals(
  trx: TrxOrDb,
  { patient_id, encounter_id }: {
    patient_id: string
    encounter_id: string | 'open'
  },
): Promise<Measurement<keyof Measurements>[]> {
  let query = trx
    .selectFrom('patient_measurements')
    .innerJoin(
      'measurements',
      'measurements.name',
      'patient_measurements.measurement_name',
    )
    .where('patient_measurements.patient_id', '=', patient_id)
    .select([
      'measurement_name',
      'patient_measurements.value',
      'measurements.units',
      'patient_measurements.is_flagged',
    ])

  // TODO: abstract this out into patient_encounters model
  if (encounter_id !== 'open') {
    query = query.where('patient_measurements.encounter_id', '=', encounter_id)
  } else {
    query = query.innerJoin(
      'patient_encounters',
      'patient_encounters.id',
      'patient_measurements.encounter_id',
    )
      .where('patient_encounters.patient_id', '=', patient_id)
      .where('patient_encounters.closed_at', 'is', null)
  }

  const measurement_rows = await query.execute()

  const measurements: Measurement<keyof Measurements>[] = []
  for (
    const { measurement_name, value, units, is_flagged } of measurement_rows
  ) {
    const measurement: Measurement<keyof Measurements> = {
      measurement_name: measurement_name as keyof Measurements,
      snomed_code: VITALS_SNOMED_CODE[measurement_name as keyof Measurements],
      value: parseFloat(value),
      units: units as 'cm' | 'kg' | 'celsius' | 'mmHg' | '%' | 'mg/dL' | 'bpm',
      is_flagged: is_flagged || false,
    }
    measurements.push(measurement)
  }
  return measurements
}
