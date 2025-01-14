import { parseDateTime } from '../util/date.ts'

export default function createMigration(migrationName: string) {
  if (!migrationName) {
    console.error(
      'Please provide a migration name as in\ndeno task migrate:create name',
    )
  }

  const { year, month, day, hour, minute, second } = parseDateTime(
    new Date(),
    'twoDigit',
  )

  const migrationFileName =
    `${year}${month}${day}${hour}${minute}${second}_${migrationName}.ts`

  const initialContents = `import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {

}

export function down(db: Kysely<unknown>) {

}
`

  const filePath = `db/migrations/${migrationFileName}`

  Deno.writeTextFile(filePath, initialContents)

  console.log('Created migration file: ', filePath)
}
