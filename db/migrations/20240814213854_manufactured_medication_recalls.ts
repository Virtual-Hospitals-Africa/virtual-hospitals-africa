import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
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
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('manufactured_medication_recalls').execute()
}
