import { opts } from './db.ts'
import { runCommand } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import { redis } from '../external-clients/redis.ts'
import { migrateCommand } from './migrate.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

async function recreateDatabase() {
  assert(opts)
  assertEquals(
    opts.host,
    'localhost',
    'This script only works on localhost, not production',
  )

  console.log('Flushing redis...')
  await redis.flushdb()

  console.log('Dropping database...')
  try {
    await runCommand('dropdb', {
      args: [opts.dbname, '-U', opts!.username],
    })
  } catch (e) {
    if (e.message.includes('other session')) {
      console.error('Database is in use, cannot drop.')
      Deno.exit(1)
    }
    console.log('Database does not exist, skipping drop.')
  }

  console.log('Recreating database...')
  const args = ['-h', opts.host, '-U', opts!.username, '-w', opts.dbname]
  if (opts.password) {
    args.push('-W')
    args.push(opts.password)
  }
  await runCommand('createdb', {
    args,
  })
}

export async function reset() {
  await recreateDatabase()
  await migrateCommand('all')
  await runCommand('deno', {
    args: ['task', 'db:codegen'],
  })
}

if (import.meta.main) {
  await reset()
}
