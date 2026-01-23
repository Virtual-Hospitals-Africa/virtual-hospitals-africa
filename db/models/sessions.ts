import { assert } from 'std/assert/assert.ts'
import { IdSelection, TrxOrDb } from '../../types.ts'
import { base, identity, simpleBaseQuery } from './_base.ts'

export type EntityType = 'health_worker' | 'regulator'

const baseQuery = simpleBaseQuery('sessions' as const)

export const sessions = base({
  top_level_table: 'sessions' as const,
  baseQuery,
  formatResult: identity,
  // caching: {
  //   number_of_items: 100,
  //   cache_writes: true,
  // },
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
  // deno-lint-ignore require-await
  async tickUpdatedAt(_trx: TrxOrDb, _session_id: string) {
    return
    // console.log('session_id', session_id)
    // const session = sessions.getFromCache(session_id)
    // console.log('const session = sessions.getFromCache(session_id)', session)
    // const updates = { updated_at: new Date() }
    // console.log('const updates = { updated_at: new Date() }', updates)
    // if (session) {
    //   Object.assign(session, updates)
    // }

    // debugLog(trx
    //   .updateTable('sessions')
    //   .where('id', '=', session_id)
    //   .set(updates))

    // await trx
    //   .updateTable('sessions')
    //   .where('id', '=', session_id)
    //   .set(updates)
    //   .execute()

    // console.log('updated session')
  },
})
