import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    phone_number: string
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
) {
  return trx
    .updateTable('prescriptions')
    .set({ alphanumeric_code: opts.alphanumeric_code })
    .where('phone_number', '=', opts.phone_number)
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
