import { assert } from 'std/assert/assert.ts'
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import { DB } from '../db.d.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'

let DATABASE_URL = Deno.env.get('DATABASE_URL') ||
  Deno.env.get('HEROKU_POSTGRESQL_MAUVE_URL') || ''

const BUILDING = Deno.env.get('BUILDING')
if (!BUILDING) assert(DATABASE_URL)

// Connect with vha_test database instead of vha_dev when running tests
if (Deno.env.get('IS_TEST')) {
  assert(
    DATABASE_URL.includes('vha_dev') || DATABASE_URL.includes('vha_test'),
    'DATABASE_URL must include vha_dev or vha_test',
  )
  DATABASE_URL = DATABASE_URL.replace('vha_dev', 'vha_test')
}

if (DATABASE_URL && !DATABASE_URL.includes('localhost')) {
  DATABASE_URL += '?sslmode=require'
}

export function parseConnectionString(
  connectionString: string,
) {
  const regex = /^postgres:\/\/(?:(.*?)(?::(.*?))?@)?(.*):(\d+)\/(.*)?$/
  const match = connectionString.match(regex)

  assert(match, 'Invalid postgres connection string format.')

  return {
    username: match[1],
    password: match[2],
    hostname: match[3],
    port: parseInt(match[4], 10),
    dbname: match[5],
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
      // deno-lint-ignore no-explicit-any
      return new PostgreSQLDriver(uri as any) as any
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db)
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler()
    },
  },
})

export default db
