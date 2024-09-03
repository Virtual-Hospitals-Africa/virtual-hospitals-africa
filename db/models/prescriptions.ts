import { sql } from 'kysely'
import { PatientMedicationUpsert, TrxOrDb } from '../../types.ts'
import * as medications from './medications.ts'
import { assert } from 'std/assert/assert.ts'

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
    .leftJoin(
      'prescription_codes',
      'prescriptions.id',
      'prescription_codes.prescription_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'prescriptions.prescriber_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .leftJoin(
      'doctor_registration_details',
      'doctor_registration_details.id',
      'health_workers.id',
    )
    .where('prescriptions.id', '=', id)
    .selectAll('prescriptions')
    .select('prescription_codes.alphanumeric_code')
    // TODO: remove this once nurses can prescribe medications
    .select(sql<string>`'Dr. ' || health_workers.name`.as('prescriber_name'))
    .select('health_workers.email as prescriber_email')
    .select(
      'doctor_registration_details.mobile_number as prescriber_mobile_number',
    )
    .executeTakeFirst()
}

export function getByCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .selectFrom('prescription_codes')
    .innerJoin(
      'prescriptions',
      'prescriptions.id',
      'prescription_codes.prescription_id',
    )
    .where('alphanumeric_code', '=', code)
    .select('prescriptions.id')
    .select('prescription_codes.created_at')
    .select('prescription_codes.updated_at')
    .select('prescriptions.prescriber_id')
    .select('prescriptions.patient_id')
    .select('prescription_codes.alphanumeric_code')
    .executeTakeFirst()
}

export async function insert(
  trx: TrxOrDb,
  { prescribing, ...to_insert }:
    & {
      prescriber_id: string
      patient_id: string
      prescribing: PrescriptionCondition[]
    }
    & ({
      doctor_review_id: string
      patient_encounter_id?: never
    } | {
      doctor_review_id?: never
      patient_encounter_id: string
    }),
) {
  assert(prescribing.length > 0)

  const prescription = await trx
    .insertInto('prescriptions')
    .values(to_insert)
    .returningAll()
    .executeTakeFirstOrThrow()

  await medications.insert(
    trx,
    prescription.id,
    prescribing,
  )

  return prescription
}

export function deleteCode(
  trx: TrxOrDb,
  code: string,
) {
  return trx
    .deleteFrom('prescription_codes')
    .where('alphanumeric_code', '=', code)
    .execute()
}
