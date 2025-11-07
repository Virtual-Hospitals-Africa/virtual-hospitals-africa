import { parseDateTime } from '../util/date.ts'

export default async function createMigration(migration_name: string) {
  if (!migration_name) {
    console.error(
      'Please provide a migration name as in\ndeno task migrate:create name',
    )
    Deno.exit(1)
  }

  const { year, month, day, hour, minute, second } = parseDateTime(
    new Date(),
  )

  const migrationFileName =
    `${year}${month}${day}${hour}${minute}${second}_${migration_name}.ts`

  const initial_contents = `import { Kysely } from "kysely"
import { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {

}

export function down(db: Kysely<DB>){

}
`

  const file_path = `db/migrations/${migrationFileName}`

  await Deno.writeTextFile(file_path, initial_contents)

  console.log('Created migration file: ', file_path)
}
