import { parseDate } from '../util/date.ts'

const [migrationName] = Deno.args

if (!migrationName) {
  console.error(
    'Please provide a migration name as in\ndeno task migrate:create name',
  )
}

const { year, month, day, hour, minute, second } = parseDate(
  new Date(),
  'twoDigit',
)

const migrationFileName =
  `${year}${month}${day}${hour}${minute}${second}_${migrationName}.ts`

const initialContents = `import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {

}

export async function down(db: Kysely<unknown>) {

}
`

Deno.writeTextFile(
  `db/migrations/${migrationFileName}`,
  initialContents,
)
