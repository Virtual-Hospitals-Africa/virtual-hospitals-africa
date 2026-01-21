import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'
import { createPointerTablePartitionedByPatientId } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createPointerTablePartitionedByPatientId(db, 'patient_record_links', {
    references: 'patient_records',
  }, (qb) =>
    qb
      .addColumn('title', 'text', (col) => col.notNull())
      .addColumn(
        'href',
        'text',
        (col) => col.notNull(),
      )
      .addColumn('thumbnail_href', 'text'))
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_links').execute()
}
