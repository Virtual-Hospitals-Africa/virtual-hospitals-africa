import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_insurance',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col.notNull()
          .references('patients.id')
          .onDelete('cascade'))
        .addColumn('insurance_provider', 'varchar(255)', (col) => col.notNull())
        .addColumn('plan_name', 'varchar(255)')
        .addColumn('membership_number', 'varchar(255)', (col) => col.notNull())
        .addColumn('valid_from', 'date', (col) => col.notNull())
        .addColumn('expire_date', 'date', (col) => col.notNull())
        .addColumn('is_dependent', 'boolean', (col) => col.notNull()),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_insurance').execute()
}
