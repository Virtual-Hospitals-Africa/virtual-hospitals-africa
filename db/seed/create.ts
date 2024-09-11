import { Kysely } from 'kysely'
import db, { uri } from '../db.ts'
import { runCommand } from '../../util/command.ts'
import { DB } from '../../db.d.ts'

const SEED_DUMPS_DIRECTORY = './db/seed/dumps'

await Deno.mkdir(SEED_DUMPS_DIRECTORY, { recursive: true })

const seeds = Array.from(Deno.readDirSync(SEED_DUMPS_DIRECTORY)).map((file) =>
  file.name
)

type TableName = keyof DB

export function create(
  table_names: TableName[],
  generate: (db: Kysely<DB>) => Promise<void>,
  opts?: { never_dump?: boolean },
) {
  async function drop(tables: TableName[] = table_names) {
    for (const table_name of tables.toReversed()) {
      await db.deleteFrom(table_name).execute()
    }
  }
  async function load() {
    const have_rows = await Promise.all(
      table_names.map(async (table_name) => {
        const row = await db
          .selectFrom(table_name)
          .selectAll()
          .executeTakeFirst()
        return !!row
      }),
    )
    const needs_loading = table_names.some((_table_name, index) =>
      !have_rows[index]
    )
    if (!needs_loading) {
      console.log('Seed already loaded')
      return
    }

    const tables_with_data = table_names.filter((_table_name, index) =>
      have_rows[index]
    )
    await drop(tables_with_data)

    const all_seeds_present = table_names.every((table_name) => {
      const seed_name = `${table_name}.tsv`
      return seeds.includes(seed_name)
    })

    if (!all_seeds_present) {
      return generate(db)
    }

    await runCommand('./db/seed/tsv_load.sh', {
      args: [uri].concat(table_names),
    })
  }
  async function dump() {
    if (opts?.never_dump) return
    await runCommand('./db/seed/tsv_dump.sh', {
      args: [uri].concat(table_names),
    })
  }
  async function recreate() {
    await drop()
    await generate(db)
    await dump()
  }
  async function reload() {
    await drop()
    await load()
  }
  return { drop, load, dump, recreate, generate, reload, table_names }
}
