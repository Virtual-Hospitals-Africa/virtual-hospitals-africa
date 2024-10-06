import { Kysely, /*, sql*/ sql } from 'kysely'
import { upsertTrigger } from '../helpers.ts'
import { DB } from '../../db.d.ts'
// import { createStandardTable } from '../createStandardTable.ts'

const t1 = upsertTrigger(
  'Patient',
  'phone_number',
  `
    (
      SELECT elem->>'value'
      FROM jsonb_array_elements(NEW.content::jsonb->'telecom') AS elem
      WHERE elem->>'system' = 'phone'
      LIMIT 1
    )
  `,
)

const t2 = upsertTrigger(
  'Patient',
  'organizationId',
  `substring(NEW.organization from 'Organization/(.*)')`,
)

const t3 = upsertTrigger(
  'Patient',
  'national_id_number',
  `
    (
      SELECT elem->>'value'
      FROM jsonb_array_elements(NEW.content::jsonb->'identifier') AS elem
      WHERE elem->>'system' = 'https://github.com/Umlamulankunzi/Zim_ID_Codes/blob/master/README.md'
      LIMIT 1
    )
  `,
)

export async function up(db: Kysely<DB>) {
  // await db.schema
  //   .createType('gender')
  //   .asEnum([
  //     'male',
  //     'female',
  //     'other',
  //   ])
  //   .execute()

  await db.schema.alterTable('Patient')
    .addColumn(
      'organizationId',
      'uuid',
      (col) => col.references('Organization.id'),
    )
    .addColumn('phone_number', 'varchar(255)')
    .addColumn(
      'national_id_number',
      'varchar(50)',
      (col) =>
        col.unique().check(
          sql`national_id_number IS NULL OR national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
        ),
    )
    // TODO remove this in favor of medplum's handling of this
    .addColumn(
      'avatar_media_id',
      'uuid',
      (col) => col.references('media.id'),
    )
    // TODO remove this in favor of medplum's handling of this
    .addColumn(
      'primary_doctor_id',
      'uuid',
      (col) => col.references('employment.id'),
    )
    // TODO remove this in favor of medplum's handling of this
    .addColumn('unregistered_primary_doctor_name', 'varchar(255)')
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
    .execute()

  await t1.create(db)
  await t2.create(db)
  await t3.create(db)

  // await createStandardTable(
  //   db,
  //   'patients',
  //   (qb) =>
  //     qb.addColumn('phone_number', 'varchar(255)')
  //       .addColumn('name', 'varchar(255)', (col) => col.notNull())
  //       .addColumn('gender', sql`gender`)
  //       .addColumn('birthDate', 'date')
  //       .addColumn('national_id_number', 'varchar(50)')
  //       .addColumn(
  //         'avatar_media_id',
  //         'uuid',
  //         (col) => col.references('media.id'),
  //       )
  //       .addColumn(
  //         'organizationId',
  //         'uuid',
  //         (col) => col.references('Organization.id'),
  //       )
  //       .addColumn('ethnicity', 'varchar(50)')
  //       .addColumn(
  //         'intake_completed',
  //         'boolean',
  //         (col) => col.notNull().defaultTo(false),
  //       )
  //       .addColumn(
  //         'primary_doctor_id',
  //         'uuid',
  //         (col) => col.references('employment.id'),
  //       )
  //       .addColumn('unregistered_primary_doctor_name', 'varchar(255)')
  //       .addUniqueConstraint('patient_national_id_number', [
  //         'national_id_number',
  //       ])
  //       .addUniqueConstraint('patient_phone_number', ['phone_number'])
  //       .addCheckConstraint(
  //         'patient_national_id_number_format',
  //         sql`national_id_number IS NULL OR national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
  //       )
  //       .addCheckConstraint(
  //         'one_primary_doctor',
  //         sql`(
  //         (primary_doctor_id IS NOT NULL AND unregistered_primary_doctor_name IS NULL) OR
  //         (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NOT NULL) OR
  //         (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NULL)
  //       )`,
  //     ),
  // )
}

export async function down(_db: Kysely<unknown>) {
  // await db.schema.dropTable('patients').execute()
  // await db.schema.dropType('gender').execute()
}
