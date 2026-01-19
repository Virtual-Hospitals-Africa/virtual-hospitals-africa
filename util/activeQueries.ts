// Monitor active queries in real-time
// Run with: deno run --allow-env --allow-net --allow-read util/activeQueries.ts

import db from '../db/db.ts'
import { sql } from 'kysely'

interface ActiveQuery {
  pid: number
  application_name: string | null
  state: string
  query_start: Date | null
  state_change: Date | null
  wait_event_type: string | null
  wait_event: string | null
  query: string | null
}

async function showActiveQueries() {
  const queries = await sql<ActiveQuery>`
    SELECT
      pid,
      application_name,
      state,
      query_start,
      state_change,
      wait_event_type,
      wait_event,
      LEFT(query, 200) as query
    FROM pg_stat_activity
    WHERE application_name LIKE '%:%'  -- Only show queries tagged with routes
      AND pid != pg_backend_pid()       -- Exclude this query
    ORDER BY query_start DESC
  `.execute(db)

  console.clear()
  console.log('Active Queries by Route')
  console.log('Refreshing every 2 seconds... (Ctrl+C to exit)\n')
  console.log('─'.repeat(120))

  if (queries.rows.length === 0) {
    console.log('No active queries with route tags found.')
    console.log('\nTip: Hit some endpoints in your app to see queries appear here.')
  } else {
    for (const row of queries.rows) {
      console.log(`\nRoute: ${row.application_name}`)
      console.log(`State: ${row.state}`)
      console.log(`Started: ${row.query_start?.toISOString() || 'N/A'}`)
      if (row.wait_event) {
        console.log(`Waiting: ${row.wait_event_type}/${row.wait_event}`)
      }
      console.log(`Query: ${row.query}`)
      console.log('─'.repeat(120))
    }
  }

  console.log(`\nTotal active queries: ${queries.rows.length}`)
}

// Show queries and refresh every 2 seconds
let intervalId: number | null = null

try {
  await showActiveQueries()
  intervalId = setInterval(showActiveQueries, 2000)

  // Keep the process running
  await new Promise(() => {})
} catch (error) {
  if (error instanceof Deno.errors.Interrupted) {
    console.log('\n\nStopped monitoring.')
  } else {
    console.error('Error:', error)
  }
} finally {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
  await db.destroy()
}
