// deno-lint-ignore-file no-explicit-any
import { Migration, MigrationResult, Migrator } from 'kysely'
import db from './db.ts'
import * as medplum from '../external-clients/medplum/server.ts'
import last from '../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const migrations: Record<
  string,
  Migration
> = {}
for (const migrationFile of Deno.readDirSync('./db/migrations')) {
  const migrationName = migrationFile.name
  assert(!migrationName.includes('seed'), 'Seed migrations are not supported')
  const migration = await import(`./migrations/${migrationName}`)
  migrations[migrationName] = migration.default || migration
}

const migrationTargets = Object.keys(migrations).sort()

const migrator = new Migrator({
  db,
  provider: {
    getMigrations: () => Promise.resolve(migrations),
  },
})

function targetError(cmd: string) {
  console.error(
    `Please specify a valid target as in\n\n  deno task db:migrate:${cmd} ${
      migrationTargets[0]
    }\n\nValid targets:\n${migrationTargets.join('\n')}`,
  )
  return Deno.exit(1)
}

function findTarget(target: string, cmd: string) {
  const target_file = last(target.split('/'))
  assert(target_file)
  const matching_targets = migrationTargets.filter((it) =>
    it.includes(target_file)
  )
  if (matching_targets.length === 1) {
    return matching_targets[0]
  }
  return targetError(cmd)
}

export const migrate = {
  async medplum() {
    await medplum.runMigrations()
    return {
      error: null,
      results: [],
    }
  },
  async check() {
    const migrations = await migrator.getMigrations()
    const migrations_not_yet_run = migrations.filter((it) => !it.executedAt)
    if (!migrations_not_yet_run.length) return {}
    console.error('The following migrations have not yet been run:')
    migrations_not_yet_run.forEach((it) => {
      console.error(`  ${it.name}`)
    })
    console.error('Please run "deno task db:migrate:latest" and try again.')
    return Deno.exit(1)
  },
  async latest() {
    return migrator.migrateToLatest()
  },
  up() {
    return migrator.migrateUp()
  },
  down() {
    return migrator.migrateDown()
  },
  async wipe() {
    const results: MigrationResult[] = []
    while (true) {
      const migration = await migrator.migrateDown()
      results.push(...(migration.results || []))
      if (migration.error) return { error: migration.error, results }
      if (!migration.results?.length) break
    }
    return { error: null, results }
  },
  to(target: string) {
    if (!target) return targetError('to')
    return migrator.migrateTo(findTarget(target, 'to'))
  },
  async 'redo:from'(target: string) {
    if (!target) return targetError('redo:from')
    console.log('Migrating down...')
    const migration = findTarget(target, 'redo:from')
    const migration_index = migrationTargets.indexOf(migration)
    const migration_just_before = migrationTargets[migration_index - 1]
    logMigrationResults(await migrator.migrateTo(migration_just_before))
    console.log('\nMigrating up to latest...')
    return migrator.migrateToLatest()
  },
}

export function logMigrationResults({ error, results }: any) {
  results?.forEach((it: any) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    throw error
  }
}

export async function migrateCommand(
  cmd: keyof typeof migrate,
  target?: string,
) {
  const command = migrate[cmd]
  assert(command, `Unknown migration command: ${cmd}`)
  logMigrationResults(await command(target!))
}

if (import.meta.main) {
  if (!Deno.args.length) {
    console.error(
      'Please provide a migration name as in\ndeno task migrate:create name',
    )
    Deno.exit(1)
  }

  migrateCommand(Deno.args[0] as any, Deno.args[1])
}
