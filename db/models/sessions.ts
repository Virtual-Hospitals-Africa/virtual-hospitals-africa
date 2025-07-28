import { TrxOrDb } from '../../types.ts'

export type EntityType = 'health_worker' | 'regulator'

export function create(
  trx: TrxOrDb,
  entity_type: EntityType,
  { entity_id }: { entity_id: string },
) {
  return trx
    .insertInto('sessions')
    .values({ entity_type, entity_id })
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function remove(
  trx: TrxOrDb,
  entity_type: EntityType,
  { session_id }: { session_id: string },
) {
  return trx
    .deleteFrom('sessions')
    .where('id', '=', session_id)
    .where('entity_type', '=', entity_type)
    .execute()
}

export function getBySessionId(
  trx: TrxOrDb,
  session_id: string,
) {
  return trx
    .selectFrom('sessions')
    .where('id', '=', session_id)
    .select(['entity_id', 'entity_type'])
    .executeTakeFirst()
}
