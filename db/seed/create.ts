// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import db, { uri } from '../db.ts'
import { runCommand } from '../../util/command.ts'

const SEED_DUMPS_DIRECTORY = './db/seed/dumps'

await Deno.mkdir(SEED_DUMPS_DIRECTORY, { recursive: true })

const seeds = Array.from(Deno.readDirSync(SEED_DUMPS_DIRECTORY)).map(file => file.name)

export function create(
  table_names: string[],
  generate: (db: Kysely<any>) => Promise<void>,
) {
  return {
    table_names,
    async load(opts?: { reload?: boolean }) {
      console.log(table_names, opts)
      const all_seeds_present = table_names.every((table_name) => {
        const seed_name = `${table_name}.tsv`
        return seeds.includes(seed_name)
      })
      if (!all_seeds_present || opts?.reload) {
        for (const table_name of table_names.toReversed()) {
          console.log(`deleting ${table_name}`)
          await db.deleteFrom(table_name as any).execute()
          if (seeds.includes(`${table_name}.tsv`)) {
            await Deno.remove(`${SEED_DUMPS_DIRECTORY}/${table_name}.tsv`)
          }
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
