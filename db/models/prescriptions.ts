import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    patient_id: string | null
    prescription_id: string
    alphanumeric_code?: string
    contents: string
  },
) {
  return trx
    .insertInto('prescriptions')
    .values(opts)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function updateCode(
  trx: TrxOrDb,
  opts: {
    patient_id: string | null
    alphanumeric_code?: string
  },
){
  return trx
  .updateTable('prescriptions')
  .set({ alphanumeric_code: opts.alphanumeric_code })  
  .where('patient_id', '=', opts.patient_id)  
  .returningAll()
  .executeTakeFirstOrThrow();
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
