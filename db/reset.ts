import { opts } from './db.ts'
import { runCommand } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import { redis } from '../external-clients/redis.ts'
import { migrate } from './migrate.ts'
import { parseArgs } from '@std/cli/parse-args'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { spinner } from '../util/spinner.ts'

async function recreateDatabase() {
  assert(opts)
  assertEquals(
    opts.host,
    'localhost',
    'This script only works on localhost, not production',
  )

  await spinner('Flushing redis', redis.flushdb())

  await spinner(
    'Dropping database',
    runCommand('dropdb', {
      args: [opts.dbname, '-U', opts!.username],
    }),
  ).catch((e) => {
    if (e.message.includes('other session')) {
      console.error('Database is in use, cannot drop.')
      Deno.exit(1)
    }
    console.log('Database does not exist, skipping drop.')
  })

  await spinner('Recreating database', () => {
    assert(opts)
    const args = ['-h', opts.host, '-U', opts!.username, '-w', opts.dbname]
    if (opts.password) {
      args.push('-W')
      args.push(opts.password)
    }
    return runCommand('createdb', {
      args,
    })
  })
}

export async function reset(opts: { recreate?: boolean | string[] } = {}) {
  await recreateDatabase()
  await migrate.all(opts)
  await runCommand('deno', {
    args: ['task', 'db:codegen'],
  })
}

if (import.meta.main) {
  const flags = parseArgs(Deno.args)
  let recreate = flags.r || flags.recreate
  if (typeof recreate === 'string') {
    recreate = recreate.split(',')
  }
  await reset({ recreate })
}
