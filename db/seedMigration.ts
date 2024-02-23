// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import db from './db.ts'

const SEED_DIRECTORY = './db/seeds'

await new Deno.Command('mkdir', {
  args: ['-p', SEED_DIRECTORY],
}).output()

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
      for (const table_name of table_names) {
        const row = await db.selectFrom(table_name as any).selectAll()
          .executeTakeFirst()
        if (row) {
          throw new Error(`Table ${table_name} is not empty`)
        }
      }
      const result = await new Deno.Command('./db/tsv_load_seeds.sh', {
        args: table_names,
      }).output()
      if (result.code) {
        console.error(new TextDecoder().decode(result.stderr))
        return Deno.exit(result.code)
      }
    },
    async dump() {
      const result = await new Deno.Command('./db/tsv_dump_seeds.sh', {
        args: table_names,
      }).output()
      if (result.code) {
        console.error(new TextDecoder().decode(result.stderr))
        return Deno.exit(result.code)
      }
    },
  }
}
