import 'dotenv'
import { assert } from 'std/assert/assert.ts'
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import { DatabaseSchema } from '../types.ts'
import { PostgreSQLDriver } from 'kysely-deno-postgres'

const BUILDING = Deno.env.get('BUILDING')

let DATABASE_URL = Deno.env.get('DATABASE_URL') ||
  Deno.env.get('HEROKU_POSTGRESQL_MAUVE_URL')

if (!BUILDING) {
  assert(DATABASE_URL)
} else {
  DATABASE_URL = 'NEVER_USED'
}

// Connect with vha_test database instead of vha_dev when running tests
if (Deno.env.get('IS_TEST')) {
  assert(
    DATABASE_URL.includes('vha_dev') || DATABASE_URL.includes('vha_test'),
    'DATABASE_URL must include vha_dev or vha_test',
  )
  DATABASE_URL = DATABASE_URL.replace('vha_dev', 'vha_test')
}

// deno-lint-ignore no-explicit-any
const uri: any = DATABASE_URL.includes('localhost')
  ? DATABASE_URL
  : `${DATABASE_URL}?sslmode=require`

const db = new Kysely<DatabaseSchema>({
  dialect: {
    createAdapter() {
      return new PostgresAdapter()
    },
    createDriver() {
      // deno-lint-ignore no-explicit-any
      return new PostgreSQLDriver(uri) as any
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
