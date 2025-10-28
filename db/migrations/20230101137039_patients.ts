import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createType('sex')
    .asEnum([
      'male',
      'female',
      'other',
      'prefer not to say',
    ])
    .execute()

  await createStandardTable(
    db,
    'patients',
    (qb) =>
      qb.addColumn('phone_number', 'varchar(255)')
        .addColumn('name', 'varchar(255)')
        .addColumn('first_names', 'varchar(255)')
        .addColumn('surname', 'varchar(255)')
        .addColumn('preferred_name', 'varchar(255)')
        .addColumn('sex', sql`sex`)
        .addColumn('gender', 'varchar(255)')
        .addColumn('date_of_birth', 'date')
        .addColumn('national_id_number', 'varchar(50)')
        .addColumn('first_language', 'varchar(50)')
        .addColumn(
          'avatar_media_id',
          'uuid',
          (col) => col.references('media.id'),
        )
        .addColumn(
          'address_id',
          'uuid',
          (col) => col.references('addresses.id'),
        )
        .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
        .addColumn(
          'nearest_organization_id',
          'uuid',
          (col) => col.references('organizations.id'),
        )
        .addColumn('preferred_language_code_iso_639_2_b', 'varchar(3)', (col) =>
          col.references('languages.iso_639_2_b'))
        .addColumn('ethnicity', 'varchar(50)')
        .addColumn(
          'completed_registration',
          'boolean',
          (col) =>
            col.notNull().defaultTo(false),
        )
        .addColumn(
          'primary_doctor_id',
          'uuid',
          (col) =>
            col.references('employment.id'),
        )
        .addColumn('unregistered_primary_doctor_name', 'varchar(255)')
        .addUniqueConstraint('patient_national_id_number', [
          'national_id_number',
        ])
        .addUniqueConstraint('patient_phone_number', ['phone_number'])
        .addCheckConstraint(
          'completed_registration_means_has_name_dob_and_sex',
          sql`(
          (NOT completed_registration) OR
          (completed_registration AND name IS NOT NULL AND date_of_birth IS NOT NULL AND sex IS NOT NULL AND gender IS NOT NULL)
        )`,
        )
        .addCheckConstraint(
          'one_primary_doctor',
          sql`(
          (primary_doctor_id IS NOT NULL AND unregistered_primary_doctor_name IS NULL) OR
          (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NOT NULL) OR
          (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NULL)
        )`,
        )
        .addCheckConstraint(
          'name_matches_first_names_and_surname',
          sql`(
          (name = first_names || ' ' || surname) OR
          (name IS NULL AND first_names IS NULL AND surname IS NULL)
        )`,
        )
        .addCheckConstraint(
          'name_and_preferred_name_nullability',
          sql`(
          (name IS NULL) = (preferred_name IS NULL)
        )`,
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patients').execute()
  await db.schema.dropType('sex').execute()
}
