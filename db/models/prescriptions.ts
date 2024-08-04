import { sql } from 'kysely'
import { PatientMedicationUpsert, TrxOrDb } from '../../types.ts'
import { differenceInDays } from '../../util/date.ts'
// import { assert } from 'std/assert/assert.ts'

export type PrescriptionCondition = {
  patient_condition_id: string
  start_date: string
  medications: PatientMedicationUpsert[]
}

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

async function insertMedicationsInfomations(
  trx: TrxOrDb,
  prescription_id: string,
  condition: PrescriptionCondition,
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
      patient_condition_id: condition.patient_condition_id,
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

  const inserted_patient_condition_medications = await trx
    .insertInto('patient_condition_medications')
    .values(medications)
    .returning('id')
    .execute()

  await Promise.all(
    inserted_patient_condition_medications.map((medication) =>
      trx
        .insertInto('patient_prescription_medications')
        .values({
          patient_condition_medication_id: medication.id,
          prescription_id: prescription_id,
        })
        .execute()
    ),
  )
}

export async function createtPrescription(
  trx: TrxOrDb,
  values: {
    prescriber_id: string
    patient_id: string
    prescribing: PrescriptionCondition[]
  },
) {
  const prescription = await insert(
    trx,
    values.prescriber_id,
    values.patient_id,
  )

  await Promise.all(
    values.prescribing.map((PrescriptionCondition) => (
      insertMedicationsInfomations(
        trx,
        prescription.id,
        PrescriptionCondition,
      )
    )),
  )

  return prescription.id
}
