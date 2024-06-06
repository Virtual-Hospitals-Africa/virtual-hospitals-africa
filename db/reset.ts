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
  try {
    await runCommand('dropdb', {
      args: [opts.dbname, '-U', opts!.username],
    })
  } catch (_e) {
    console.log('Database does not exist, skipping drop.')
  }

  console.log('Recreating database...')
  await runCommand('createdb', {
    args: ['-h', 'localhost', '-U', opts!.username, '-w', opts.dbname],
  })
}

export async function reset() {
  await recreateDatabase()
  await migrateCommand('all')
}

if (import.meta.main) {
  await reset()
}
