import { TrxOrDb } from '../../types.ts'

export function insert(
  trx: TrxOrDb,
  opts: {
    alphanumeric_code: string
    contents: string
  },
) {
  return trx
    .insertInto('prescriptions')
    // deno-lint-ignore no-explicit-any
    .values(opts as any)
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
