import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'
import { assertOnInsert } from '../helpers.ts'

// Add assertion triggers for target_uuid existence
const organization_assertion = assertOnInsert({
  table: 'message_draft_targets',
  function_name: 'assert_organization_exists_for_draft_target',
  assertion: `
      NEW.target_type != 'organization' OR
      EXISTS (SELECT 1 FROM organizations WHERE id = NEW.target_uuid)
    `,
  error_message: `'Organization with specified target_uuid does not exist'`,
})

const employment_assertion = assertOnInsert({
  table: 'message_draft_targets',
  function_name: 'assert_employment_exists_for_draft_target',
  assertion: `
      NEW.target_type != 'employee' OR
      EXISTS (SELECT 1 FROM employment WHERE id = NEW.target_uuid)
    `,
  error_message: `'Employment with specified target_uuid does not exist'`,
})

const patient_assertion = assertOnInsert({
  table: 'message_draft_concerning',
  function_name: 'assert_patient_exists_for_draft_concerning',
  assertion: `
      NEW.target_type != 'patient' OR
      EXISTS (SELECT 1 FROM patients WHERE id = NEW.target_uuid)
    `,
  error_message: `'Patient with specified target_uuid does not exist'`,
})

const patient_record_assertion = assertOnInsert({
  table: 'message_draft_concerning',
  function_name: 'assert_patient_record_exists_for_draft_concerning',
  assertion: `
      NEW.target_type != 'patient_record' OR
      EXISTS (SELECT 1 FROM patient_records WHERE id = NEW.target_uuid)
    `,
  error_message: `'Patient record with specified target_uuid does not exist'`,
})

export async function up(db: Kysely<DB>) {
  await db.schema.createType('message_target_type')
    .asEnum([
      'organization',
      'employee',
      'role',
      'organization_category',
      'locality',
      'administrative_area_level_1',
      'administrative_area_level_2',
    ])
    .execute()

  await db.schema.createType('message_concerning_type')
    .asEnum(['patient', 'patient_record'])
    .execute()

  await db.schema.createType('message_priority')
    .asEnum([
      'Non-urgent',
      'Urgent',
      'Very urgent',
      'Emergency',
    ])
    .execute()

  await createStandardTable(
    db,
    'message_drafts',
    (qb) =>
      qb
        .addColumn('employment_id', 'uuid', (col) => col.notNull().references('employment.id').onDelete('cascade'))
        .addColumn('body', 'text', (col) => col.notNull())
        .addColumn('priority', sql`message_priority`, (col) => col.notNull()),
  )

  await createStandardTable(
    db,
    'message_draft_targets',
    (qb) =>
      qb
        .addColumn('message_draft_id', 'uuid', (col) => col.notNull().references('message_drafts.id').onDelete('cascade'))
        .addColumn('target_type', sql`message_target_type`, (col) => col.notNull())
        .addColumn('target_uuid', 'uuid')
        .addColumn('target_value', 'varchar(255)')
        .addCheckConstraint(
          'target_value_and_uuid_based_on_type',
          sql`(
            (target_type IN ('role', 'organization_category', 'locality', 'administrative_area_level_1', 'administrative_area_level_2') AND target_value IS NOT NULL AND target_uuid IS NULL)
            OR
            (target_type IN ('organization', 'employee') AND target_uuid IS NOT NULL AND target_value IS NULL)
          )`,
        ),
  )

  await createStandardTable(
    db,
    'message_draft_concerning',
    (qb) =>
      qb
        .addColumn('message_draft_id', 'uuid', (col) => col.notNull().references('message_drafts.id').onDelete('cascade'))
        .addColumn('concerning_type', sql`message_concerning_type`, (col) => col.notNull())
        .addColumn('concerning_uuid', 'uuid', (col) => col.notNull()),
  )

  await organization_assertion.up(db)
  await employment_assertion.up(db)
  await patient_assertion.up(db)
  await patient_record_assertion.up(db)

  await db.schema
    .createIndex('idx_message_drafts_employment_id')
    .on('message_drafts')
    .column('employment_id')
    .execute()

  await db.schema
    .createIndex('idx_message_draft_targets_message_draft_id')
    .on('message_draft_targets')
    .column('message_draft_id')
    .execute()

  await db.schema
    .createIndex('idx_message_draft_concerning_message_draft_id')
    .on('message_draft_concerning')
    .column('message_draft_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await patient_record_assertion.down(db)
  await patient_assertion.down(db)
  await employment_assertion.down(db)
  await organization_assertion.down(db)

  await db.schema.dropTable('message_draft_concerning').execute()
  await db.schema.dropTable('message_draft_targets').execute()
  await db.schema.dropTable('message_drafts').execute()

  await db.schema.dropType('message_priority').execute()
  await db.schema.dropType('message_concerning_type').execute()
  await db.schema.dropType('message_target_type').execute()
}
