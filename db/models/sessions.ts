import { IdSelection, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'

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
  session_id: string,
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

export function getHealthWorkerId(
  trx: TrxOrDb,
  session_id: string,
): IdSelection {
  return trx
    .selectFrom('sessions')
    .where('entity_type', '=', 'health_worker')
    .where('id', '=', session_id)
    .select('entity_id as id')
}

export function getRegulatorId(
  trx: TrxOrDb,
  session_id: string,
): IdSelection {
  return trx
    .selectFrom('sessions')
    .where('entity_type', '=', 'regulator')
    .where('id', '=', session_id)
    .select('entity_id as id')
}

export function tickUpdatedAt(
  trx: TrxOrDb,
  entity_type: EntityType,
  session_id: string,
) {
  return trx
    .updateTable('sessions')
    .where('entity_type', '=', entity_type)
    .where('id', '=', session_id)
    .set({
      updated_at: now,
    })
}
