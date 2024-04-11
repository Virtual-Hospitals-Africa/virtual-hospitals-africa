import { Migration, MigrationResult, Migrator } from 'kysely'
import db from './db.ts'
import * as medplum from '../external-clients/medplum.ts'
import last from '../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const migrations: Record<
  string,
  Migration & {
    load?: () => Promise<Deno.CommandOutput>
    dump?: () => Promise<Deno.CommandOutput>
  }
> = {}
for (const migrationFile of Deno.readDirSync('./db/migrations')) {
  const migrationName = migrationFile.name
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

async function wipe() {
  const results: MigrationResult[] = []
  while (true) {
    const migration = await migrator.migrateDown()
    results.push(...(migration.results || []))
    if (migration.error) return { error: migration.error, results }
    if (!migration.results?.length) break
  }
  return { error: null, results }
}

async function startMigrating(cmd: string, target?: string) {
  function targetError() {
    console.error(
      `Please specify a valid target as in\n\n  deno task migrate:${cmd} ${
        migrationTargets[0]
      }\n\nValid targets:\n${migrationTargets.join('\n')}`,
    )
    return Deno.exit(1)
  }

  function findTarget(target: string) {
    const target_file = last(target.split('/'))
    assert(target_file)
    let matching_targets = migrationTargets.filter((it) =>
      it.includes(target_file)
    )
    if (matching_targets.length > 1 && cmd.startsWith('seeds:')) {
      matching_targets = matching_targets.filter((it) => it.includes('_seed'))
    }
    if (matching_targets.length === 1) {
      return matching_targets[0]
    }
    return targetError()
  }

  switch (cmd) {
    case 'medplum': {
      await medplum.runMigrationsAgainstLocalDB()
      console.log('DONE')
      return {
        error: null,
        results: [],
      }
    }
    case 'check': {
      const migrations = await migrator.getMigrations()
      const migrations_not_yet_run = migrations.filter((it) => !it.executedAt)
      if (!migrations_not_yet_run.length) return {}
      console.error('The following migrations have not yet been run:')
      migrations_not_yet_run.forEach((it) => {
        console.error(`  ${it.name}`)
      })
      console.error('Please run "deno task db:migrate:latest" and try again.')
      return Deno.exit(1)
    }
    case 'latest':
      return migrator.migrateToLatest()
    case 'up':
      return migrator.migrateUp()
    case 'down':
      return migrator.migrateDown()
    case 'wipe':
      return wipe()
    case 'to': {
      if (!target) return targetError()
      return migrator.migrateTo(findTarget(target))
    }
    case 'redo:from': {
      if (!target) return targetError()
      console.log('Migrating down...')
      const migration = findTarget(target)
      const migration_index = migrationTargets.indexOf(migration)
      const migration_just_before = migrationTargets[migration_index - 1]
      const { error, results } = await migrator.migrateTo(migration_just_before)

      results?.forEach((it) => {
        if (it.status === 'Success') {
          console.log(
            `migration "${it.migrationName}" was executed successfully`,
          )
        } else if (it.status === 'Error') {
          console.error(`failed to execute migration "${it.migrationName}"`)
        }
      })

      if (error) {
        console.error('failed to migrate')
        throw error
      }

      console.log('\nMigrating up to latest...')
      return migrator.migrateToLatest()
    }
    case 'seeds:dump': {
      if (target) {
        const migration = migrations[findTarget(target)]
        if (!migration.dump) {
          console.error(`Migration ${target} does not support seeds:dump`)
          return Deno.exit(1)
        }
        await migration.dump()
        return {}
      }
      for (const migrationName of migrationTargets) {
        const migration = migrations[migrationName]
        if (migration.dump) {
          await migration.dump()
        }
      }
      return {}
    }
    case 'seeds:load': {
      if (target) {
        const migration = migrations[findTarget(target)]
        if (!migration.load) {
          console.error(`Migration ${target} does not support seeds:load`)
          return Deno.exit(1)
        }
        await migration.load()
        return {}
      }
      for (const migrationName of migrationTargets) {
        const migration = migrations[migrationName]
        if (migration.load) {
          await migration.load()
          console.log(`seeds loaded for ${migrationName}`)
        }
      }
      return {}
    }
    default:
      throw new Error(`Invalid command ${cmd}`)
  }
}

export async function migrate(cmd: string, target?: string) {
  const { error, results } = await startMigrating(cmd, target)

  results?.forEach((it) => {
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

if (import.meta.main) {
  if (!Deno.args.length) {
    console.error(
      'Please provide a migration name as in\ndeno task migrate:create name',
    )
    Deno.exit(1)
  }

  migrate(Deno.args[0], Deno.args[1])
}
