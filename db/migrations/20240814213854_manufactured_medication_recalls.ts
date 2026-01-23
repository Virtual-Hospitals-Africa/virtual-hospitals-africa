import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'manufactured_medication_recalls', (qb) =>
    qb
      .addColumn(
        'manufactured_medication_id',
        'uuid',
        (col) =>
          col.notNull().references('manufactured_medications.id').onDelete(
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
    .createIndex('idx_manufactured_medication_recalls_manufactured_medication_id')
    .on('manufactured_medication_recalls')
    .column('manufactured_medication_id')
    .execute()

  await db.schema
    .createIndex('idx_manufactured_medication_recalls_recalled_by')
    .on('manufactured_medication_recalls')
    .column('recalled_by')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('manufactured_medication_recalls').execute()
}
