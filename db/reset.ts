import { assert } from 'std/assert/assert.ts'
import db from './db.ts'
import { TrxOrDb } from '../types.ts'

// facilities is also top level, but we don't want to delete it
// as it is seeded by the migrations
const topLevelTables = [
  'patients' as const,
  'health_workers' as const,
  'health_worker_invitees' as const,
  'media' as const,
]

export async function resetInTest(trx: TrxOrDb = db) {
  assert(Deno.env.get('IS_TEST'), 'Don\'t run this outside tests!')

  await Promise.all(
    topLevelTables.map((table) => trx.deleteFrom(table).execute()),
  )
}
