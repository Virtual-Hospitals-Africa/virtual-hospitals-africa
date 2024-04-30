import { opts } from './db.ts'
import { runCommand } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import { redis } from '../external-clients/redis.ts'
import { migrateCommand } from './migrate.ts'

async function recreateDatabase() {
  assert(opts)

  console.log('Flushing redis...')
  await redis.flushdb()

  console.log('Dropping database...')
  await runCommand('dropdb', {
    args: [opts.dbname],
  })

  console.log('Recreating database...')
  const whoami = await runCommand('whoami')
  await runCommand('createdb', {
    args: ['-h', 'localhost', '-U', whoami.trim(), '-w', opts.dbname],
  })
}

export async function reset() {
  await recreateDatabase()
  await migrateCommand('all')
}

if (import.meta.main) {
  await reset()
}
