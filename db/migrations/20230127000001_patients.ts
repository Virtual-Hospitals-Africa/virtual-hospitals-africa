import { Kysely, /*, sql*/ 
sql} from 'kysely'
import { upsertTrigger } from '../helpers.ts'
import { DB } from '../../db.d.ts'
// import { createStandardTable } from '../createStandardTable.ts'

const t1 = upsertTrigger('Pa')
const t2 = upsertTrigger('Patient', 'organizationId', `substring(NEW.organization from 'Organization/(.*)')`)

export async function up(db: Kysely<DB>) {
  // await db.schema
  //   .createType('gender')
  //   .asEnum([
  //     'male',
  //     'female',
  //     'non-binary',
  //   ])
  //   .execute()

  await db.schema.alterTable('Patient')
    .addColumn('organizationId', 'uuid', (col) => col.references('Organization.id'))
    .addColumn('national_id_number', 'varchar(50)', col => col.unique().check(sql`national_id_number IS NULL OR national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`))
    .execute()

  await t2.create(db)

  // await createStandardTable(
  //   db,
  //   'patients',
  //   (qb) =>
  //     qb.addColumn('phone_number', 'varchar(255)')
  //       .addColumn('name', 'varchar(255)', (col) => col.notNull())
  //       .addColumn('gender', sql`gender`)
  //       .addColumn('date_of_birth', 'date')
  //       .addColumn('national_id_number', 'varchar(50)')
  //       .addColumn(
  //         'avatar_media_id',
  //         'uuid',
  //         (col) => col.references('media.id'),
  //       )
  //       .addColumn(
  //         'address_id',
  //         'uuid',
  //         (col) => col.references('address.id'),
  //       )
  //       .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
  //       .addColumn(
  //         'nearest_organization_id',
  //         'uuid',
  //         (col) => col.references('Organization.id'),
  //       )
  //       .addColumn('ethnicity', 'varchar(50)')
  //       .addColumn(
  //         'completed_intake',
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
