import { sql } from 'kysely'
import { PatientMedicationUpsert, RenderedPrescription, RenderedPrescriptionWithMedications, TrxOrDb } from '../../types.ts'
import * as medications from './medications.ts'
import * as drugs from './drugs.ts'
import * as prescription_medications from './prescription_medications.ts'
import { assert } from 'std/assert/assert.ts'

export type PrescriptionCondition = {
  patient_condition_id: string
  start_date: string
  medications: PatientMedicationUpsert[]
}

const getBase = (trx: TrxOrDb) =>
  trx
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
    
    .selectAll('prescriptions')
    .select('prescription_codes.alphanumeric_code')
    // TODO: remove this once nurses can prescribe medications
    .select(sql<string>`'Dr. ' || health_workers.name`.as('prescriber_name'))
    .select('health_workers.email as prescriber_email')
    .select(
      'doctor_registration_details.mobile_number as prescriber_mobile_number',
    )

export function getById(
  trx: TrxOrDb,
  id: string,
): Promise<RenderedPrescription | undefined> {
  return getBase(trx)
    .where('prescriptions.id', '=', id)
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

export async function getFromReview(
  trx: TrxOrDb,
  { review_id }: { review_id: string },
): Promise<RenderedPrescriptionWithMedications | null> {
  const prescription = await getBase(trx)
    .where('prescriptions.doctor_review_id', '=', review_id)
    .executeTakeFirst()

  if (!prescription) return null

  const medications_of_prescription = await prescription_medications.getByPrescriptionId(
    trx,
    prescription.id
  )

  const drug_ids = medications_of_prescription.map((m) => m.drug_id)

  const drugs_of_medications = await drugs.search(trx, {
    ids: drug_ids,
  })

  const medications_with_drugs = medications_of_prescription.map((medication) => {
    const drug = drugs_of_medications.find((drug) => drug.id === medication.drug_id)
    assert(drug)
    return { ...medication, drug }
  })

  return {
    ...prescription,
    medications: medications_with_drugs,
  }
}
