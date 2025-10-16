import { parseDateTime } from '../util/date.ts'

export default async function createMigration(migrationName: string) {
  if (!migrationName) {
    console.error(
      'Please provide a migration name as in\ndeno task migrate:create name',
    )
    Deno.exit(1)
  }

  const { year, month, day, hour, minute, second } = parseDateTime(
    new Date(),
    'twoDigit',
  )

  const migrationFileName =
    `${year}${month}${day}${hour}${minute}${second}_${migrationName}.ts`

  const initial_contents = `import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {

}

export function down(db: Kysely<unknown>) {

}
`

  const filePath = `db/migrations/${migrationFileName}`

  await Deno.writeTextFile(filePath, initial_contents)

  console.log('Created migration file: ', filePath)
}
