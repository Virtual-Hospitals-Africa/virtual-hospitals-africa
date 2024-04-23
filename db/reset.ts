import { opts } from './db.ts'
import { runCommand } from '../util/command.ts'
import { assert } from 'std/assert/assert.ts'
import { redis } from '../external-clients/redis.ts'
import { logMigrationResults, migrate } from './migrate.ts'
import { run } from './seed/run.ts'

export async function reset() {
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

  console.log('Running medplum migrations...')
  await migrate.medplum()

  console.log('Running VHA migrations...')
  logMigrationResults(await migrate.latest())

  console.log('Loading seeds...')
  await run({ fn: 'load' })

  console.log('Done!')
}

if (import.meta.main) {
  await reset()
}
