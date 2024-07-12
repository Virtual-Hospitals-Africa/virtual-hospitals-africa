import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    phone_number: string
    prescription_id: string
    alphanumeric_code?: string
    contents: string
  },
) {
  return trx
    .insertInto('prescriptions')
    .values(opts)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(opts))
    .returningAll()
    .executeTakeFirstOrThrow()
}


export function updateCode(
  trx: TrxOrDb,
  opts: {
    phone_number: string
    alphanumeric_code: string
  },
){
  return trx
  .updateTable('prescriptions')
  .set({ alphanumeric_code: opts.alphanumeric_code })  
  .where('phone_number', '=', opts.phone_number)  
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

export function getUrl(
  trx: TrxOrDb,
  phone_number: string,
) {
  // '/prescriptions/7274de02-0cf0-459d-afd3-358d87bb13d3?code=12345'
}
