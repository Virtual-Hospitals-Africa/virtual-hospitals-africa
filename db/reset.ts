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

export async function resetInTest(trx: TrxOrDb = db) {
  assert(Deno.env.get('IS_TEST'), 'Don\'t run this outside tests!')
  await Promise.all([
    trx.deleteFrom('patients').execute(),
    trx.deleteFrom('health_workers').execute(),
    trx.deleteFrom('health_worker_invitees').execute(),
    trx.deleteFrom('media').execute(),
  ])
}
