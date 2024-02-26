import { sql } from 'kysely'
import db from './db.ts'
import { TrxOrDb } from '../types.ts'
import { selectAllTables, selectAllViews } from './meta.ts'
import { selectAllTypes } from './meta.ts'

export async function dropEverything(trx: TrxOrDb = db) {
  await sql`DROP EXTENSION IF EXISTS pg_trgm CASCADE`.execute(trx)
  await sql`DROP EXTENSION IF EXISTS postgis CASCADE`.execute(trx)

  const all_tables = await selectAllTables(trx)
  for (const table_name of all_tables) {
    await trx.schema.dropTable(table_name).cascade().execute()
  }

  const all_views = await selectAllViews(trx)
  for (const view_name of all_views) {
    await trx.schema.dropView(view_name).cascade().execute()
  }

  const types = await selectAllTypes(trx)
  for (const { typname } of types.rows) {
    await trx.schema.dropType(typname).execute()
  }

  // Can skip dropping functions by always using `CREATE OR REPLACE FUNCTION`
}

if (import.meta.main) {
  await dropEverything()
}
