//import { sql } from 'kysely'
import { PatientMedicationUpsert, TrxOrDb } from '../../types.ts'
import * as medications from './medications.ts'

export type PrescriptionCondition = {
  patient_condition_id: string
  start_date: string
  medications: PatientMedicationUpsert[]
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

export async function insert(
  trx: TrxOrDb,
  values: {
    prescriber_id: string
    patient_id: string
    prescribing: PrescriptionCondition[]
  },
) {
  const prescription = await trx
    .insertInto('prescriptions')
    .values({
      prescriber_id: values.prescriber_id,
      patient_id: values.patient_id,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  await medications.insert(
    trx,
    prescription.id,
    values.prescribing,
  )

  return prescription
}
