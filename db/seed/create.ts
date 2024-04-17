// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import db, { uri } from '../db.ts'
import { runCommand } from '../../util/command.ts'

const SEED_DUMPS_DIRECTORY = './db/seed/dumps'

await Deno.mkdir(SEED_DUMPS_DIRECTORY, { recursive: true })

const seeds = Array.from(Deno.readDirSync(SEED_DUMPS_DIRECTORY))

export function create(
  table_names: string[],
  generate: (db: Kysely<any>) => Promise<void>,
) {
  return {
    async load() {
      const all_seeds_present = table_names.every((table_name) => {
        const seed_name = `${table_name}.tsv`
        return seeds.some((seed) => seed.name === seed_name)
      })
      if (!all_seeds_present) {
        for (const table_name of table_names.toReversed()) {
          await db.deleteFrom(table_name as any).execute()
        }
        return generate(db)
      }

      const have_rows = await Promise.all(
        table_names.map(async (table_name) => {
          const row = await db
            .selectFrom(table_name as any)
            .selectAll()
            .executeTakeFirst()
          return !row
        }),
      )

      const needs_loading = table_names.filter((_table_name, index) =>
        have_rows[index]
      )
      await runCommand('./db/seed/tsv_load.sh', {
        args: [uri].concat(needs_loading),
      })
    },
    async dump() {
      await runCommand('./db/seed/tsv_dump.sh', {
        args: [uri].concat(table_names),
      })
    },
  }
}
