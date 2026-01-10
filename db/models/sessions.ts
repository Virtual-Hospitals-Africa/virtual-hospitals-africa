import { assert } from 'std/assert/assert.ts'
import { IdSelection, TrxOrDb } from '../../types.ts'
import { base, identity, simpleBaseQuery } from './_base.ts'

export type EntityType = 'health_worker' | 'regulator'

const baseQuery = simpleBaseQuery('sessions' as const)

export const sessions = base({
  top_level_table: 'sessions' as const,
  baseQuery,
  formatResult: identity,
  caching: {
    number_of_items: 100,
    cache_writes: true,
  },
  handleSearch(qb, search_terms: {
    entity_type: EntityType
  }) {
    return qb.where('entity_type', '=', search_terms.entity_type)
  },
  getHealthWorkerId(trx: TrxOrDb, session_id: string): string | IdSelection {
    const session = sessions.getFromCache(session_id)
    if (session) {
      assert(session.entity_type === 'health_worker')
      return session.entity_id
    }
    return trx
      .selectFrom('sessions')
      .where('entity_type', '=', 'health_worker')
      .where('id', '=', session_id)
      .select('entity_id as id')
  },
  getRegulatorId(trx: TrxOrDb, session_id: string): string | IdSelection {
    const session = sessions.getFromCache(session_id)
    if (session) {
      assert(session.entity_type === 'regulator')
      return session.entity_id
    }
    return trx
      .selectFrom('sessions')
      .where('entity_type', '=', 'regulator')
      .where('id', '=', session_id)
      .select('entity_id as id')
  },
  tickUpdatedAt(trx: TrxOrDb, session_id: string) {
    const session = sessions.getFromCache(session_id)
    const updates = { updated_at: new Date() }
    if (session) {
      Object.assign(session, updates)
    }
    return trx
      .updateTable('sessions')
      .where('id', '=', session_id)
      .set(updates)
  },
})
