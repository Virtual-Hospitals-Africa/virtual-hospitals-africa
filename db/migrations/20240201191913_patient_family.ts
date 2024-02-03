import { Kysely, sql } from 'kysely'
import {
  FAMILY_TYPES,
  MARITAL_STATUS,
  PATIENT_COHABITATIONS,
  RELIGIONS,
} from '../../shared/family.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('marital_status').asEnum(MARITAL_STATUS).execute()

  await db.schema.createType('family_type').asEnum(FAMILY_TYPES).execute()

  await db.schema.createType('religion').asEnum(RELIGIONS).execute()

  await db.schema
    .createType('patient_cohabitation')
    .asEnum(PATIENT_COHABITATIONS)
    .execute()

  await db.schema
    .createTable('patient_family')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) =>
        col.unique().notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn(
      'home_satisfaction',
      'int2',
      (col) =>
        col.check(sql`home_satisfaction >= 0 AND home_satisfaction <= 10`),
    )
    .addColumn('spiritual_satisfaction', 'int2', (col) =>
      col.check(
        sql`spiritual_satisfaction >= 0 AND spiritual_satisfaction <= 10`,
      ))
    .addColumn(
      'social_satisfaction',
      'int2',
      (col) =>
        col.check(sql`social_satisfaction >= 0 AND social_satisfaction <= 10`),
    )
    .addColumn('religion', sql`religion`)
    .addColumn('family_type', sql`family_type`)
    .addColumn('marital_status', sql`marital_status`)
    .addColumn('patient_cohabitation', sql`patient_cohabitation`)
    .execute()

  await addUpdatedAtTrigger(db, 'patient_family')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_family').execute()
  await db.schema.dropType('marital_status').execute()
  await db.schema.dropType('family_type').execute()
  await db.schema.dropType('religion').execute()
  await db.schema.dropType('patient_cohabitation').execute()
}
