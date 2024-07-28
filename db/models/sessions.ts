import { TrxOrDb } from '../../types.ts'

type Role = 'health_worker' | 'regulator'

export function create(
  trx: TrxOrDb,
  role: Role,
  { entity_id }: { entity_id: string },
) {
  return trx
    .insertInto(`${role}_sessions`)
    .values({ entity_id })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function remove(
  trx: TrxOrDb,
  role: Role,
  { session_id }: { session_id: string },
) {
  return trx
    .deleteFrom(`${role}_sessions`)
    .where('id', '=', session_id)
    .execute()
}
