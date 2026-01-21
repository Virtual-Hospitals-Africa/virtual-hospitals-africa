import { sql } from 'kysely'
import db from './db.ts'
import { spinner } from '../util/spinner.ts'

const NUM_PARTITIONS = 256

/**
 * Finds all tables that are partitioned (PARTITION BY HASH) but don't have partitions created yet,
 * and creates 256 partitions for each.
 */
async function createPartitions() {
  // Query to find partitioned tables that don't have child partitions
  const partitioned_tables = await sql<{ table_name: string }>`
    SELECT
      c.relname as table_name
    FROM
      pg_class c
    JOIN
      pg_namespace n ON n.oid = c.relnamespace
    WHERE
      c.relkind = 'p'  -- 'p' indicates a partitioned table
      AND n.nspname = 'public'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_inherits i
        WHERE i.inhparent = c.oid
      )
    ORDER BY
      c.relname
  `.execute(db)

  if (partitioned_tables.rows.length === 0) {
    console.log('No partitioned tables found that need partitions.')
    return
  }

  console.log(`Found ${partitioned_tables.rows.length} table(s) needing partitions:`)
  for (const { table_name } of partitioned_tables.rows) {
    console.log(`  - ${table_name}`)
  }

  for (const { table_name } of partitioned_tables.rows) {
    const create_statements: string[] = []
    for (let i = 0; i < NUM_PARTITIONS; i++) {
      create_statements.push(
        `CREATE TABLE ${table_name}_p${i} PARTITION OF ${table_name} FOR VALUES WITH (MODULUS ${NUM_PARTITIONS}, REMAINDER ${i});`
      )
    }
    await sql.raw(create_statements.join('\n')).execute(db)
  }

  console.log('✓ All partitions created successfully')
}

if (import.meta.main) {
  await spinner('Creating partitions for partitioned tables', createPartitions)
}

export { createPartitions }
