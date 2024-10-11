import { Kysely, sql } from 'kysely'
import {
  FAMILY_TYPES,
  MARITAL_STATUS,
  PATIENT_COHABITATIONS,
  RELIGIONS,
} from '../../shared/family.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('marital_status').asEnum(MARITAL_STATUS).execute()

  await db.schema.createType('family_type').asEnum(FAMILY_TYPES).execute()

  await db.schema.createType('religion').asEnum(RELIGIONS).execute()

  await db.schema
    .createType('patient_cohabitation')
    .asEnum(PATIENT_COHABITATIONS)
    .execute()

  await createStandardTable(db, 'patient_family', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) =>
        col.unique().notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn('religion', sql`religion`)
      .addColumn('family_type', sql`family_type`)
      .addColumn('marital_status', sql`marital_status`)
      .addColumn('patient_cohabitation', sql`patient_cohabitation`))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_family').execute()
  await db.schema.dropType('marital_status').execute()
  await db.schema.dropType('family_type').execute()
  await db.schema.dropType('religion').execute()
  await db.schema.dropType('patient_cohabitation').execute()
}
