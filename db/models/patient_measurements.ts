import {
  Measurements,
  MeasurementsUpsert,
  PatientMeasurement,
  TrxOrDb,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'

export const MEASUREMENTS: {
  [Name in keyof Measurements]: Measurements[Name][1]
} = {
  height: 'cm',
  weight: 'kg',
  temperature: 'celsius',
  blood_pressure_diastolic: 'mmHg',
  blood_pressure_systolic: 'mmHg',
  blood_oxygen_saturation: '%',
  blood_glucose: 'mg/dL',
  pulse: 'bpm',
  respiratory_rate: 'bpm',
}

export async function upsertVitals(
  trx: TrxOrDb,
  { measurements, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    measurements: MeasurementsUpsert
  },
) {
  const measurement_names = Object.keys(measurements) as (keyof Measurements)[]

  const unseen_vitals = new Set(Object.keys(MEASUREMENTS))
  assertOr400(
    measurement_names.length > 0,
    'Must provide at least one measurement',
  )

  const patient_measurements: PatientMeasurement[] = measurement_names.map(
    (name) => {
      const value = measurements[name]!
      assertOr400(value != null, `Must provide a value for ${name}`)
      assertOr400(
        typeof value === 'number',
        `Value for ${name} must be a number`,
      )
      assertOr400(
        value >= 0,
        `Value for ${name} must be greater than or equal to 0`,
      )
      unseen_vitals.delete(name)
      return {
        patient_id,
        encounter_id,
        value,
        encounter_provider_id,
        measurement_name: name,
      }
    },
  )

  const removing_vitals = trx.deleteFrom('patient_measurements')
    .where('patient_id', '=', patient_id)
    .where('encounter_id', '=', encounter_id)
    .where('measurement_name', 'in', [...unseen_vitals])
    .execute()

  const updating_vitals = trx
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
    patient_id: number
    encounter_id: number | 'open'
  },
): Promise<Partial<Measurements>> {
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

  const measurements: Partial<Measurements> = {}
  for (const { measurement_name, value, units } of measurement_rows) {
    // deno-lint-ignore no-explicit-any
    const measurement: any = [parseFloat(value), units]
    measurements[measurement_name as keyof Measurements] = measurement
  }
  return measurements
}
