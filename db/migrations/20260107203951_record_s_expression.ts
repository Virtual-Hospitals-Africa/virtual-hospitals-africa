import { Kysely, sql } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_record_s_expressions',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb.addColumn(
        's_expression',
        'text',
        (col) => col.notNull().check(sql`
          left(s_expression, 1) = '(' AND right(s_expression, 1) = ')'
        `),
      )
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_s_expressions').execute()
}
