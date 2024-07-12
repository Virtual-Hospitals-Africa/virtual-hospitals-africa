import { TrxOrDb } from '../../types.ts'

export async function upinsert(
  trx: TrxOrDb,
  opts: {
    phone_number: string
    prescription_id?: string
    code?: string
  },
) {
  return trx
    .insertInto('temporary_prescription_data')
    .values(opts)
    .onConflict((oc) => oc.column('phone_number').doUpdateSet(opts))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function getByPhoneNumber(
  trx: TrxOrDb,
  phone_number: string,
) {
  return trx
    .selectFrom('temporary_prescription_data')
    .where('phone_number', '=', phone_number)
    .selectAll()
    .executeTakeFirst()
}
