import {
  TrxOrDb,
} from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    alphanumeric_code: string,
    prescriber_id: string,
    patient_id: string,
  }
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
  opts: {
    alphanumeric_code: string,
    prescriber_id: string,
    patient_id: string,
    patient_condition_medication_id: string,
    pharmacist_id: string,
    pharmacy_id : string,
  }
) {
  const prescription = await trx
    .insertInto('prescriptions')
    .values({
      alphanumeric_code: opts.alphanumeric_code,
      prescriber_id: opts.prescriber_id,
      patient_id: opts.patient_id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const patient_prescription_medication = await trx
    .insertInto('patient_prescription_medications')
    .values({
      patient_condition_medication_id: opts.patient_condition_medication_id,
      prescription_id: prescription.id,
    })
    .returning('id')
    .executeTakeFirstOrThrow()

    await trx
      .insertInto('patient_prescription_medications_filled')
      .values({
        patient_prescription_medication_id : patient_prescription_medication.id,
        pharmacist_id: opts.pharmacist_id,
        pharmacy_id: opts.pharmacy_id,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    
    return prescription;
}
