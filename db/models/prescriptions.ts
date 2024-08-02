import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
import { PreExistingConditionUpsert } from './patient_conditions.ts'

export async function insert(
  trx: TrxOrDb,
  prescriber_id: string,
  patient_id: string,
) {
  return trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: await generateAlphanumericCode(trx),
      prescriber_id: prescriber_id,
      patient_id: patient_id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function getById(
  trx: TrxOrDb,
  id: string,
) {
  return trx
    .selectFrom('prescriptions')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export function getByCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .selectFrom('prescriptions')
    .where('alphanumeric_code', '=', code)
    .selectAll()
    .executeTakeFirst()
}

export async function createPatientPrescriptionMedications(
  trx: TrxOrDb,
  condition: PreExistingConditionUpsert,
  parent_condition: string,
  prescription_id: string,
) {
  const medications = (condition.medications || []).map((medication) => {
    const start_date = medication.start_date || condition.start_date
    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }
    return {
      patient_condition_id: parent_condition,
      medication_id:
        (!medication.manufactured_medication_id && medication.medication_id) ||
        null, // omit medication_id if manufactured_medication_id is present
      manufactured_medication_id: medication.manufactured_medication_id || null,
      strength: medication.strength,
      route: medication.route,
      schedules: sql<string[]>`
        ARRAY[
          ROW(${medication.dosage}, ${medication.intake_frequency}, ${duration}, ${duration_unit})
        ]::medication_schedule[]
      `,
      start_date,
      special_instructions: medication.special_instructions || null,
    }
  })

  const patient_condition_medication = await trx
    .insertInto('patient_condition_medications')
    .values(medications)
    .returning('id')
    .executeTakeFirstOrThrow()

  await trx.insertInto('patient_prescription_medications')
    .values({
      patient_condition_medication_id: patient_condition_medication.id,
      prescription_id: prescription_id,
    })
    .execute()

  return patient_condition_medication
}

async function generateAlphanumericCode(
  trx: TrxOrDb,
) {
  const existCodesObj = await trx
    .selectFrom('prescriptions')
    .select('alphanumeric_code')
    .execute()

  const existCodesArray = existCodesObj.map((row) => row.alphanumeric_code)
  let alphanumeric_code: string
  do {
    alphanumeric_code = Math.floor(100000 + Math.random() * 900000).toString()
  } while (
    existCodesArray.includes(alphanumeric_code)
  )
  return alphanumeric_code
}
