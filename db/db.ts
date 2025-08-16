import { assert } from 'std/assert/assert.ts'
import { Pool } from 'pg'
import {
  Kysely,
  PostgresAdapter,
  PostgresDriver,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import { DB } from '../db.d.ts'
import { debugReplaceAll } from './helpers.ts'

let DATABASE_URL = Deno.env.get('DATABASE_URL') || ''

const NO_EXTERNAL_CONNECT = Deno.env.get('NO_EXTERNAL_CONNECT')
if (!NO_EXTERNAL_CONNECT) assert(DATABASE_URL)

// Connect with vha_test database instead of vha_dev when running tests
if (Deno.env.get('IS_TEST')) {
  assert(
    DATABASE_URL.includes('vha_dev') || DATABASE_URL.includes('vha_test'),
    'DATABASE_URL must include vha_dev or vha_test',
  )
  DATABASE_URL = DATABASE_URL.replace('vha_dev', 'vha_test')
}

if (
  DATABASE_URL && !DATABASE_URL.includes('localhost') &&
  !DATABASE_URL.includes('sslmode') && !Deno.env.get('NO_DATABASE_SSL')
) {
  DATABASE_URL += '?sslmode=require'
}

export function parseConnectionString(
  connectionString: string,
) {
  const regex =
    /^postgres:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/(\w*)?(\?sslmode=require)?$/
  const match = connectionString.match(regex)

  assert(match, 'Invalid postgres connection string format.')

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
    ssl: match[6] ? { require: true, rejectUnauthorized: false } : undefined,
  }
}

export const uri = DATABASE_URL

export const opts = uri ? parseConnectionString(uri) : null

const db = new Kysely<DB>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter()
    },
    createDriver() {
      return new PostgresDriver({
        pool: new Pool(opts || {}),
      })
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db)
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler()
    },
  },
  log(event) {
    if (event.level !== 'error') return

    // deno-lint-ignore no-explicit-any
    const error_due_to_lock = (event.error as any).message.startsWith(
      'This connection is currently locked',
    )
    if (error_due_to_lock) return

    console.error('Query failed')
    console.error(event.error)

    // TODO, mask PII
    console.error(debugReplaceAll(
      event.query.sql,
      event.query.parameters,
    ))
  },
})

export default db
