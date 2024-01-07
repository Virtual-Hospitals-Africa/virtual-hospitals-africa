import { Measurements, PatientMeasurement, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonBuildObject } from '../helpers.ts'

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
}

export function add(
  trx: TrxOrDb,
  { measurements, ...rest }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    measurements: Partial<Measurements>
  },
) {
  const measurement_names = Object.keys(measurements) as (keyof Measurements)[]
  assertOr400(
    measurement_names.length > 0,
    'Must provide at least one measurement',
  )

  const patient_measurements: PatientMeasurement[] = measurement_names.map(
    (name) => {
      const [value, units] = measurements[name]!
      assertOr400(value != null, `Must provide a value for ${name}`)
      assertOr400(
        typeof value === 'number',
        `Value for ${name} must be a number`,
      )
      assertOr400(
        value >= 0,
        `Value for ${name} must be greater than or equal to 0`,
      )
      assertOr400(
        units === MEASUREMENTS[name],
        `Units for ${name} must be ${MEASUREMENTS[name]}`,
      )
      return {
        ...rest,
        measurement_name: name,
        value,
      }
    },
  )

  return trx
    .insertInto('patient_measurements')
    .values(patient_measurements)
    .returning('id')
    .execute()
}

export async function getEncounterVitals(
  trx: TrxOrDb,
  { patient_id, encounter_id }: { patient_id: number, encounter_id: number | 'open' },
): Promise<Partial<Measurements>> {
  let query = trx
    .selectFrom('patient_measurements')
    .innerJoin('measurements', 'measurements.name', 'patient_measurements.measurement_name')
    .where('patient_measurements.patient_id', '=', patient_id)
    .select([
      'measurement_name',
      'patient_measurements.value',
      'measurements.units',
    ])

  if (encounter_id !== 'open') {
    query = query.where('patient_measurements.encounter_id', '=', encounter_id)
  } else {
    query = query.innerJoin('patient_encounters', 'patient_encounters.id', 'patient_measurements.encounter_id')
      .where('patient_encounters.patient_id', '=', patient_id)
      .where('patient_encounters.closed_at', 'is', null)
  }

  const measurement_rows = await query.execute()

  const measurements: Partial<Measurements> = {}
  for (const { measurement_name, value, units } of measurement_rows) {
    // deno-lint-ignore no-explicit-any
    measurements[(measurement_name as keyof Measurements)] = [parseFloat(value), units] as any
  }
  return measurements
}

// export async function getGraph(
//   trx: TrxOrDb,
//   { patient_id, measurement_name }: { patient_id: number, measurement_name: keyof Measurements },
// ) {
//   return trx
//     .selectFrom('patient_measurements')
//     .where('patient_measurements.patient_id', '=', patient_id)
//     .where('patient_measurements.measurement_name', '=', measurement_name)
//     .orderBy('created_at', 'asc')
//     .execute()
// }
