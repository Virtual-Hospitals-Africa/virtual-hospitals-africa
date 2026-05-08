// Lists indexes on user-created tables in the local DB (.env) and prod DB
// (.env.prod), then prints a diff between them.
//
// Usage:
//   deno run -A --env scripts/diff_db_indexes.ts
//
// Output: prints local-only and prod-only indexes, plus indexes that share a
// (schema, table, name) but differ in their definition.

import { Pool } from 'pg'
import { parse as parseDotenv } from '@std/dotenv'
import { parseConnectionString } from '../db/db.ts'

type IndexRow = {
  schemaname: string
  tablename: string
  indexname: string
  indexdef: string
}

type IndexKey = string // `${schema}.${table}.${name}`

async function readDatabaseUrl(envPath: string): Promise<string> {
  const text = await Deno.readTextFile(envPath)
  const parsed = parseDotenv(text)
  const url = parsed.DATABASE_URL
  if (!url) throw new Error(`No DATABASE_URL found in ${envPath}`)
  return url
}

async function fetchIndexes(label: string, databaseUrl: string): Promise<IndexRow[]> {
  const opts = parseConnectionString(databaseUrl)
  // Force SSL for non-localhost (prod RDS) since we are not loading the global
  // env-driven SSL fixup that db/db.ts performs.
  const ssl = opts.host !== 'localhost'
    ? { require: true, rejectUnauthorized: false }
    : undefined

  const pool = new Pool({ ...opts, ssl })
  try {
    // Restrict to user schemas. `pg_indexes` already excludes pg_catalog
    // system tables but includes information_schema-style schemas, so filter
    // explicitly. We also drop migration bookkeeping tables.
    const { rows } = await pool.query<IndexRow>(`
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT IN ('kysely_migration', 'kysely_migration_lock')
      ORDER BY schemaname, tablename, indexname
    `)
    console.error(`[${label}] fetched ${rows.length} indexes from ${opts.host}/${opts.database}`)
    return rows
  } finally {
    await pool.end()
  }
}

function key(row: IndexRow): IndexKey {
  return `${row.schemaname}.${row.tablename}.${row.indexname}`
}

function toMap(rows: IndexRow[]): Map<IndexKey, IndexRow> {
  const m = new Map<IndexKey, IndexRow>()
  for (const r of rows) m.set(key(r), r)
  return m
}

function printSection(title: string, lines: string[]) {
  console.log(`\n=== ${title} (${lines.length}) ===`)
  for (const line of lines) console.log(line)
}

if (import.meta.main) {
  const [localUrl, prodUrl] = await Promise.all([
    readDatabaseUrl('.env'),
    readDatabaseUrl('.env.prod'),
  ])

  if (localUrl === prodUrl) {
    throw new Error('.env and .env.prod resolve to the same DATABASE_URL — refusing to diff a DB against itself')
  }

  const [local, prod] = await Promise.all([
    fetchIndexes('LOCAL', localUrl),
    fetchIndexes('PROD', prodUrl),
  ])

  const localMap = toMap(local)
  const prodMap = toMap(prod)

  const allKeys = new Set<IndexKey>([...localMap.keys(), ...prodMap.keys()])
  const sortedKeys = [...allKeys].sort()

  const localOnly: string[] = []
  const prodOnly: string[] = []
  const differing: string[] = []

  for (const k of sortedKeys) {
    const l = localMap.get(k)
    const p = prodMap.get(k)
    if (l && !p) {
      localOnly.push(`${k}\n    ${l.indexdef}`)
    } else if (p && !l) {
      prodOnly.push(`${k}\n    ${p.indexdef}`)
    } else if (l && p && l.indexdef !== p.indexdef) {
      differing.push(`${k}\n    LOCAL: ${l.indexdef}\n    PROD:  ${p.indexdef}`)
    }
  }

  console.log(`Local indexes: ${local.length}`)
  console.log(`Prod indexes:  ${prod.length}`)

  printSection('LOCAL ONLY (missing on prod)', localOnly)
  printSection('PROD ONLY (missing on local)', prodOnly)
  printSection('DIFFERING DEFINITIONS', differing)

  if (!localOnly.length && !prodOnly.length && !differing.length) {
    console.log('\nNo differences.')
  }
}
