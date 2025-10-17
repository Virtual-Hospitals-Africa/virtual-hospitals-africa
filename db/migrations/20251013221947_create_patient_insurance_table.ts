import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable('patient_insurance')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('patient_id', 'uuid', (col) =>
      col.notNull().references('patients.id').onDelete('cascade')
    )
    .addColumn('insurance_provider', 'text')
    .addColumn('plan_name', 'text')
    .addColumn('membership_number', 'text')
    .addColumn('valid_from', 'date')
    .addColumn('expire_date', 'date')
    .addColumn('is_dependent', 'boolean')
    .addColumn('has_no_insurance', 'boolean')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute()

  await db.schema
    .createIndex('patient_insurance_patient_id_idx')
    .on('patient_insurance')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('patient_insurance_patient_id_unique')
    .on('patient_insurance')
    .column('patient_id')
    .unique()
    .execute()

}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable('patient_insurance').execute()
}