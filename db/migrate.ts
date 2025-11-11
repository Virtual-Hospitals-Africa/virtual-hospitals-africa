import {
  Migration,
  MigrationResult,
  MigrationResultSet,
  Migrator,
} from 'kysely'
import db from './db.ts'
import last from '../util/last.ts'
import { assert } from 'std/assert/assert.ts'
import createMigration from './createMigration.ts'
import { spinner } from '../util/spinner.ts'
import { Maybe } from '../types.ts'
import { exists } from '../util/exists.ts'

const migrations: Record<
  string,
  Migration
> = {}
for (const migration_file of Deno.readDirSync('./db/migrations')) {
  const migration_name = migration_file.name
  assert(!migration_name.includes('seed'), 'Seed migrations are not supported')
  const migration = await import(`./migrations/${migration_name}`)
  migrations[migration_name] = migration.default || migration
}

const migration_targets = Object.keys(migrations).sort()

const migrator = new Migrator({
  db,
  provider: {
    getMigrations: () => Promise.resolve(migrations),
  },
})

function targetError(cmd: string) {
  console.error(
    `Please specify a valid target as in\n\n  deno task db:migrate:${cmd} ${
      migration_targets[0]
    }\n\nValid targets:\n  ${migration_targets.join('\n  ')}`,
  )
  return Deno.exit(1)
}

function findTarget(target: string, cmd: string) {
  const target_file = last(target.split('/'))
  assert(target_file)
  const matching_targets = migration_targets.filter((it) =>
    it.includes(target_file)
  )
  if (matching_targets.length === 1) {
    return matching_targets[0]
  }
  if (matching_targets.length > 1) {
    console.error(
      `Multiple migrations found matching ${target}. Please be more specific. Found targets:\n${
        matching_targets.join(
          '\n',
        )
      }`,
    )
    return Deno.exit(1)
  }
  return targetError(cmd)
}

export const migrate = {
  async check() {
    const migrations = await migrator.getMigrations()
    const migrations_not_yet_run = migrations.filter((it) => !it.executedAt)
    if (!migrations_not_yet_run.length) return {}
    console.error('The following migrations have not yet been run:')
    migrations_not_yet_run.forEach((it) => {
      console.error(`  ${it.name}`)
    })
    throw new Error('Please run "deno task db:migrate latest" and try again.')
  },
  async latest() {
    await spinner('Migrating to latest', async () => {
      logMigrationResults(await migrator.migrateToLatest())
    })
    console.log(`Run shell command deno task db:codegen`)
  },
  up() {
    return spinner('Migrating up', migrator.migrateUp().then(logMigrationResults))
  },
  down() {
    return spinner('Migrating down', migrator.migrateDown().then(logMigrationResults))
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
  async redo() {
    await migrate.down()
    const result = await migrate.up()
    const migrations = await migrator.getMigrations()
    const last_result = result?.results && last(result.results)
    const last_migration = exists(last([...migrations]))
    if (last_result?.migrationName === last_migration.name) {
      console.log(`Run shell command deno task db:codegen`)
    }
  },
  async 'redo:from'(target: string) {
    if (!target) return targetError('redo:from')
    const results = await spinner('Migrating down', () => {
      const migration = findTarget(target, 'redo:from')
      const migration_index = migration_targets.indexOf(migration)
      const migration_just_before = migration_targets[migration_index - 1]
      return migrator.migrateTo(migration_just_before)
    })
    logMigrationResults(results)
    await spinner('Migrating up to latest', migrator.migrateToLatest())
    console.log(`Run shell command deno task db:codegen`)
  },
  async all(opts: { recreate?: boolean | string[] } = {}) {
    await spinner('Running VHA migrations', migrate.latest, {
      success: 'Ran VHA migrations',
    })

    const seeds = await import('./seed/run.ts')
    if (opts.recreate === true) {
      await spinner('Recreating seeds', seeds.recreate())
    } else if (opts.recreate) {
      const { recreate } = opts
      await spinner(
        `Loading seeds, recreating ${recreate.join(', ')}`,
        () => seeds.loadRecreating(recreate),
      )
    } else {
      await spinner('Loading seeds', seeds.load())
    }
  },
  create(migration_name: string) {
    return createMigration(migration_name)
  },
}

export function logMigrationResults(
  migration_result_set: Maybe<Partial<MigrationResultSet>> | void,
) {
  const { error, results } = migration_result_set || {}
  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(
        `  migration "${it.migrationName}" was executed successfully`,
      )
    } else if (it.status === 'Error') {
      console.error(`  failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('  failed to migrate')
    throw error
  }
  return migration_result_set
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
  const [cmd] = Deno.args
  const recognized_command = !!cmd && cmd in migrate
  if (!recognized_command) {
    console.error(
      'Please provide a valid command name as in\ndeno task db:migrate $cmd\nAvailable commands:',
    )
    Object.keys(migrate).forEach((it) => console.error(`  ${it}`))
    Deno.exit(1)
  }

  // deno-lint-ignore no-explicit-any
  await migrateCommand(cmd as any, Deno.args[1])
}
