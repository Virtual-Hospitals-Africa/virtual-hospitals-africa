import { sql } from 'kysely'
import db from './db.ts'
import { TrxOrDb } from '../types.ts'
import { assert } from 'std/assert/assert.ts'

export async function selectAllNonMetaTables(
  trx: TrxOrDb,
): Promise<string[]> {
  const tables = await sql<{ table_name: string }>`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND table_name NOT LIKE 'kysely_%'
       AND table_name != 'spatial_ref_sys'
  `.execute(trx)

  return tables.rows.map(({ table_name }) => table_name)
}

export async function selectAllTables(
  trx: TrxOrDb,
) {
  const tables = await sql<{ table_name: string; table_type: string }>`
    SELECT *
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
  `.execute(trx)

  return tables.rows.map(({ table_name }) => table_name)
}

export async function selectAllViews(
  trx: TrxOrDb,
) {
  const tables = await sql<{ table_name: string; table_type: string }>`
    SELECT *
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'VIEWS'
  `.execute(trx)

  return tables.rows.map(({ table_name }) => table_name)
}

export async function selectEnumValues(enum_name: string) {
  const result = await sql<{ enumlabel: string }>`
    SELECT enumlabel
      FROM pg_type t
      JOIN pg_enum e on t.oid = e.enumtypid  
     WHERE t.typname = ${enum_name}
    ;
  `.execute(db)
  return result.rows.map(({ enumlabel }) => enumlabel)
}

// Leave data that is seeded by migrations, namely facilities, conditions, and drugs
const topLevelTables = [
  'patients' as const,
  'address' as const,
  'health_workers' as const,
  'health_worker_invitees' as const,
  'media' as const,
]
export async function resetInTest(trx: TrxOrDb = db) {
  assert(Deno.env.get('IS_TEST'), "Don't run this outside tests!")

  await Promise.all(
    topLevelTables.map((table) => trx.deleteFrom(table).execute()),
  )
}

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

  const types = await sql<{ typname: string }>`
    SELECT typname FROM pg_type
    WHERE typnamespace = 2200
    AND typcategory != 'A'
    ORDER BY oid desc
  `.execute(trx)

  for (const { typname } of types.rows) {
    await trx.schema.dropType(typname).execute()
  }
}
