import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'medication_recalls', (qb) =>
    qb
      .addColumn(
        'medication_availability_id',
        'uuid',
        (col) =>
          col.notNull().references('medication_availabilities.id').onDelete(
            'cascade',
          ),
      )
      .addColumn(
        'recalled_by',
        'uuid',
        (col) => col.notNull().references('regulators.id').onDelete('cascade'),
      )
      .addColumn(
        'recalled_at',
        'timestamp',
        (col) => col.notNull(),
      ))

  await db.schema
    .createIndex('idx_medication_recalls_medication_availability_id')
    .on('medication_recalls')
    .column('medication_availability_id')
    .execute()

  await db.schema
    .createIndex('idx_medication_recalls_recalled_by')
    .on('medication_recalls')
    .column('recalled_by')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('medication_recalls').execute()
}
