// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import db from './db.ts'
import { runCommand } from '../util/command.ts'
import * as inParallel from '../util/inParallel.ts'

const SEED_DIRECTORY = './db/seeds'

await Deno.mkdir(SEED_DIRECTORY, { recursive: true })

const seeds = Array.from(Deno.readDirSync(SEED_DIRECTORY))

export function createSeedMigration(
  table_names: string[],
  generate: (db: Kysely<any>) => Promise<void>,
) {
  return {
    up(db: Kysely<any>) {
      const all_seeds_present = table_names.every((table_name) => {
        const seed_name = `${table_name}.tsv`
        return seeds.some((seed) => seed.name === seed_name)
      })
      if (!all_seeds_present) {
        return generate(db)
      }
    },
    async down(db: Kysely<any>) {
      for (const table_name of table_names.toReversed()) {
        await db.deleteFrom(table_name).execute()
      }
    },
    async load() {
      const load_tables = await inParallel.filter(
        table_names,
        async (table_name) => {
          const row = await db
            .selectFrom(table_name as any)
            .selectAll()
            .executeTakeFirst()
          return !row
        },
      )

      await runCommand('./db/tsv_load_seeds.sh', {
        args: load_tables,
      })
    },
    async dump() {
      await runCommand('./db/tsv_dump_seeds.sh', {
        args: table_names,
      })
    },
  }
}
