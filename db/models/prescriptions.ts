//import { sql } from 'kysely'
import { PatientMedicationUpsert, TrxOrDb } from '../../types.ts'
import * as medications from './medications.ts'
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

export async function create(
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

  await medications.insert(
    trx,
    prescription.id,
    values.prescribing,
  )

  return prescription
}
