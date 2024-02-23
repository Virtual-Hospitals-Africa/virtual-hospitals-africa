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
  console.warn(
    'Deprecation warning: resetInTest is deprecated. Try to structure your test and/or code so it can run on a database in any state',
  )

  await Promise.all(
    topLevelTables.map((table) => trx.deleteFrom(table).execute()),
  )
}
