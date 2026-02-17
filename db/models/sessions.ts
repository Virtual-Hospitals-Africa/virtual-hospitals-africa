import { assert } from 'std/assert/assert.ts'
import type { IdSelection, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'

export type EntityType = 'health_worker' /* | 'regulator' */

function baseQuery(trx: TrxOrDbOrQueryCreator, opts: { entity_type: EntityType }) {
  return trx.selectFrom('sessions')
    .selectAll()
    .where('entity_type', '=', opts.entity_type)
}

export const sessions = base({
  top_level_table: 'sessions' as const,
  baseQuery,
  formatResult: identity,
  // caching: {
  //   number_of_items: 100,
  //   cache_writes: true,
  // },
  getHealthWorkerId(trx: TrxOrDbOrQueryCreator, session_id: string): string | IdSelection {
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
  // deno-lint-ignore require-await
  async tickUpdatedAt(_trx: TrxOrDbOrQueryCreator, _session_id: string) {
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
