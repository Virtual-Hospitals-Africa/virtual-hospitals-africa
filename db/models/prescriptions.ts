import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
import { PreExistingConditionUpsert } from './patient_conditions.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    alphanumeric_code: string
    prescriber_id: string
    patient_id: string
  },
) {
  return trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: opts.alphanumeric_code,
      prescriber_id: opts.prescriber_id,
      patient_id: opts.patient_id,
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

export async function createPrescription(
  trx: TrxOrDb,
  patient_id: string,
  condition: PreExistingConditionUpsert,
  opts: {
    parent_condition: string,
    alphanumeric_code: string
    prescriber_id: string
    patient_condition_medication_id: string
    pharmacist_id: string
    pharmacy_id: string
  },
) {
  const medications_json = (condition.medications || []).map((medication) => {
    const start_date = medication.start_date || condition.start_date

    const { duration, duration_unit } = medication.end_date
      ? {
        duration: differenceInDays(medication.end_date, start_date),
        duration_unit: 'days',
      }
      : { duration: 1, duration_unit: 'indefinitely' }

    return {
      patient_condition_id: opts.parent_condition,
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

  const patient_condition_medications = await trx
    .insertInto('patient_condition_medications')
    .values(medications_json)
    .returning('id')
    .execute()

    return patient_condition_medications

  // const prescription = await trx
  //   .insertInto('prescriptions')
  //   .values({
  //     alphanumeric_code: opts.alphanumeric_code,
  //     prescriber_id: opts.prescriber_id,
  //     patient_id: opts.patient_id,
  //   })
  //   .returning('id')
  //   .executeTakeFirstOrThrow()

  // const patient_prescription_medication = await trx
  //   .insertInto('patient_prescription_medications')
  //   .values({
  //     patient_condition_medication_id: opts.patient_condition_medication_id,
  //     prescription_id: prescription.id,
  //   })
  //   .returning('id')
  //   .executeTakeFirstOrThrow()

  // await trx
  //   .insertInto('patient_prescription_medications_filled')
  //   .values({
  //     patient_prescription_medication_id: patient_prescription_medication.id,
  //     pharmacist_id: opts.pharmacist_id,
  //     pharmacy_id: opts.pharmacy_id,
  //   })
  //   .returningAll()
  //   .executeTakeFirstOrThrow()

  // return prescription
}
