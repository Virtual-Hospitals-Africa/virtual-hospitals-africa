// Query performance statistics viewer
// Run with: deno run --allow-env --allow-net --allow-read util/queryStats.ts

import db from '../db/db.ts'
import { sql } from 'kysely'

interface QueryStat {
  application_name: string | null
  calls: string
  total_exec_time_ms: string
  mean_exec_time_ms: string
  max_exec_time_ms: string
  stddev_exec_time_ms: string
  query_sample: string
}

console.log('Query Performance Statistics by Route\n')
console.log('Fetching data from pg_stat_statements...\n')

try {
  // Query pg_stat_statements to get aggregated query stats by application_name
  const stats = await sql<QueryStat>`
    WITH app_queries AS (
      SELECT
        sa.application_name,
        pss.query,
        pss.calls,
        pss.total_exec_time,
        pss.mean_exec_time,
        pss.max_exec_time,
        pss.stddev_exec_time
      FROM pg_stat_statements pss
      LEFT JOIN pg_stat_activity sa ON sa.pid = pss.userid
      WHERE pss.query NOT LIKE '%pg_stat_statements%'
        AND pss.query NOT LIKE '%pg_stat_activity%'
    )
    SELECT
      COALESCE(application_name, 'unknown') as application_name,
      SUM(calls)::text as calls,
      ROUND(SUM(total_exec_time)::numeric, 2)::text as total_exec_time_ms,
      ROUND(AVG(mean_exec_time)::numeric, 2)::text as mean_exec_time_ms,
      ROUND(MAX(max_exec_time)::numeric, 2)::text as max_exec_time_ms,
      ROUND(AVG(stddev_exec_time)::numeric, 2)::text as stddev_exec_time_ms,
      (array_agg(query))[1] as query_sample
    FROM app_queries
    WHERE application_name LIKE '%:%'  -- Only show routes (METHOD:PATH format)
    GROUP BY application_name
    ORDER BY SUM(total_exec_time) DESC
    LIMIT 50
  `.execute(db)

  if (stats.rows.length === 0) {
    console.log('No query statistics found.')
    console.log('\nPossible reasons:')
    console.log('1. pg_stat_statements extension is not enabled')
    console.log('2. No queries have been executed with tagged application_name yet')
    console.log('3. Statistics have been reset\n')
    console.log('To enable: Run migration 20260120000000_pg_stat_statements.ts')
    console.log('To reset stats: SELECT pg_stat_statements_reset();')
  } else {
    console.log('Route Performance Summary:')
    console.log('─'.repeat(120))
    console.log(
      'Route'.padEnd(40) +
        'Calls'.padStart(8) +
        'Total(ms)'.padStart(12) +
        'Mean(ms)'.padStart(12) +
        'Max(ms)'.padStart(12) +
        'StdDev(ms)'.padStart(12),
    )
    console.log('─'.repeat(120))

    for (const row of stats.rows) {
      console.log(
        (row.application_name || 'unknown').padEnd(40) +
          row.calls.padStart(8) +
          row.total_exec_time_ms.padStart(12) +
          row.mean_exec_time_ms.padStart(12) +
          row.max_exec_time_ms.padStart(12) +
          row.stddev_exec_time_ms.padStart(12),
      )
    }
    console.log('─'.repeat(120))
    console.log(`\nTotal routes: ${stats.rows.length}`)
  }

  console.log('\n\nUseful queries:')
  console.log('─'.repeat(80))
  console.log('Reset statistics:')
  console.log('  SELECT pg_stat_statements_reset();')
  console.log('\nView all queries for a specific route:')
  console.log("  SELECT * FROM pg_stat_statements WHERE query LIKE '%your_table%';")
  console.log('\nView current active queries:')
  console.log("  SELECT application_name, state, query FROM pg_stat_activity WHERE application_name LIKE '%:%';")
} catch (error) {
  console.error('Error fetching query stats:', error)
  console.error('\nMake sure pg_stat_statements extension is enabled:')
  console.error('  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;')
  console.error('\nOr run the migration:')
  console.error('  deno task db:migrate')
}

await db.destroy()
