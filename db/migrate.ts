import { Migration, MigrationResult, Migrator, sql } from 'kysely'
import db from './db.ts'

const migrations: Record<string, Migration> = {}
for (const migrationFile of Deno.readDirSync('./db/migrations')) {
  const migrationName = migrationFile.name
  const migration = await import(`./migrations/${migrationName}`)
  migrations[migrationName] = migration
}

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
  switch (cmd) {
    case 'latest':
      return migrator.migrateToLatest()
    case 'up':
      return migrator.migrateUp()
    case 'down':
      return migrator.migrateDown()
    case 'wipe':
      return wipe()
    case 'to': {
      if (!target) {
        const migrations = await sql<
          { name: string }
        >`SELECT name from kysely_migration`.execute(db)
        const migrationTargets = migrations.rows.map(({ name }) => name)
        console.error(
          `Please specify a valid target as in\n\n  deno task migrate:to ${
            migrationTargets[0]
          }\n\nValid targets:\n${migrationTargets.join('\n')}`,
        )
        Deno.exit(1)
      }
      return migrator.migrateTo(target)
    }

    default:
      throw new Error('Invalid command')
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

  await db.destroy()

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
