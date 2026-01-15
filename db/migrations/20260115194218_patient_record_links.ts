import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createPointerTable(db, 'patient_record_links', {
    references: 'patient_records',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb
      .addColumn(
        'href',
        'text',
        (col) => col.notNull(),
      )
      .addColumn('title', 'text', (col) => col.notNull())
      .addColumn('thumbnail_href', 'text'))
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_links').execute()
}
