import { sql } from 'kysely'
import db from './db.ts'

export default async function selectEnumValues(enum_name: string) {
  const result = await sql<{ enumlabel: string }>`
    SELECT enumlabel
      FROM pg_type t
      JOIN pg_enum e on t.oid = e.enumtypid  
     WHERE t.typname = ${enum_name}
    ;
  `.execute(db)
  return result.rows.map(({ enumlabel }) => enumlabel)
}
