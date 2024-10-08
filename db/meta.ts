import { sql } from 'kysely'
import db from './db.ts'
import { TrxOrDb } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import { jsonArrayFrom } from './helpers.ts'

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

export function selectAllTypes(trx: TrxOrDb) {
  return sql<{ typname: string }>`
    SELECT typname
      FROM pg_type
     WHERE typnamespace = 2200
       AND typcategory != 'A'
     ORDER BY oid desc
  `.execute(trx)
}

export function selectAllFunctions(
  trx: TrxOrDb,
) {
  // deno-lint-ignore no-explicit-any
  return trx.selectFrom('information_schema.routines' as any)
    .selectAll('information_schema.routines')
    .select((eb) => [
      jsonArrayFrom(
        // deno-lint-ignore no-explicit-any
        eb.selectFrom('information_schema.parameters' as any)
          .selectAll('parameters')
          .whereRef(
            'parameters.specific_name',
            '=',
            'routines.specific_name',
          ),
      ).as('parameters'),
    ])
    // deno-lint-ignore no-explicit-any
    .where('routines.specific_schema' as any, '=', 'public')
    // deno-lint-ignore no-explicit-any
    .where('routines.routine_type' as any, '=', 'FUNCTION')
    .execute()
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

// Leave data that is seeded by migrations, namely organizations, conditions, and drugs
const topLevelTables = [
  'Patient' as const,
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
