import { assert } from 'std/assert/assert.ts'
import { opts as db_opts } from './db.ts'
import { parseArgs } from '@std/cli/parse-args'
import { isProduction } from './onLocalhost.ts'

export function argsAndEnvForPostgresScript() {
  assert(db_opts)
  const { host, database, user, password } = db_opts
  const args = ['-h', host, '-U', user, '-w', database]
  const env = password ? { PGPASSWORD: password } : undefined

  const { do_run_on_prod } = parseArgs(Deno.args, {
    boolean: ['do_run_on_prod'],
  })

  if (isProduction()) {
    assert(
      do_run_on_prod,
      'Must supply --do_run_on_prod to run against a production database',
    )
  }

  return { args, env }
}
