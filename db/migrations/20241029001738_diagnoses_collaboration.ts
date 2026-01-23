import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'diagnoses_collaboration', (qb) =>
    qb
      .addColumn('diagnosis_id', 'uuid', (col) => col.notNull().references('diagnoses.id').onDelete('cascade'))
      .addColumn('approver_id', 'uuid', (col) => col.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('is_approved', 'boolean', (col) => col.notNull())
      .addColumn('disagree_reason', 'varchar(255)'))

  await db.schema
    .createIndex('idx_diagnoses_collaboration_diagnosis_id')
    .on('diagnoses_collaboration')
    .column('diagnosis_id')
    .execute()

  await db.schema
    .createIndex('idx_diagnoses_collaboration_approver_id')
    .on('diagnoses_collaboration')
    .column('approver_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('diagnoses_collaboration').execute()
}
