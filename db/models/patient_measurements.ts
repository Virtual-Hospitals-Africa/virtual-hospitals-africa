import { Measurements, PatientMeasurement, TrxOrDb } from '../../types.ts'
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

// export async function getVitals(
//   trx: TrxOrDb,
//   { patient_id }: { patient_id: number },
// ): Promise<{

// }> {
//   return trx
//     .selectFrom('patient_measurements')

//     .execute()
// }

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
