import { assert } from 'std/assert/assert.ts'
import db from './db.ts'
import selectAllNonMetaTables from './selectAllNonMetaTables.ts'
import { TrxOrDb } from '../types.ts'

export default async function reset(trx: TrxOrDb = db) {
  const tables = await selectAllNonMetaTables(trx)
  for (const table of tables) {
    console.log(`Deleting all rows from ${table}`)
    // deno-lint-ignore no-explicit-any
    await db.deleteFrom(table as any).execute()
  }
}

// facilities is also top level, but we don't want to delete it
// as it is seeded by the migrations
const topLevelTables = [
  'patients' as const,
  'address' as const,
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
