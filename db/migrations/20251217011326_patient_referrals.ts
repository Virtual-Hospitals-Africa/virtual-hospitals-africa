import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_referrals',
    {
      references: 'patient_procedures',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'employment_id',
          'uuid',
          (col) => col.references('employment.id').onDelete('cascade'),
        )
        .addColumn(
          'organization_department_id',
          'uuid',
          (col) => col.references('organization_departments.id').onDelete('cascade'),
        )
        .addColumn(
          'organization_id',
          'uuid',
          (col) => col.references('organizations.id').onDelete('cascade'),
        )
        .addColumn(
          'organization_room_id',
          'uuid',
          (col) => col.references('organization_rooms.id').onDelete('cascade'),
        )
        .addCheckConstraint(
          'referral_to_exactly_one_entity',
          sql`(
            (employment_id IS NOT NULL AND organization_department_id IS NULL AND organization_id IS NULL AND organization_room_id IS NULL) OR
            (employment_id IS NULL AND organization_department_id IS NOT NULL AND organization_id IS NULL AND organization_room_id IS NULL) OR
            (employment_id IS NULL AND organization_department_id IS NULL AND organization_id IS NOT NULL AND organization_room_id IS NULL) OR
            (employment_id IS NULL AND organization_department_id IS NULL AND organization_id IS NULL AND organization_room_id IS NOT NULL)
          )`,
        ),
  )

  await db.schema
    .createIndex('idx_patient_referrals_employment_id')
    .on('patient_referrals')
    .column('employment_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_referrals_organization_department_id')
    .on('patient_referrals')
    .column('organization_department_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_referrals_organization_id')
    .on('patient_referrals')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_referrals_organization_room_id')
    .on('patient_referrals')
    .column('organization_room_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_referrals').execute()
}
