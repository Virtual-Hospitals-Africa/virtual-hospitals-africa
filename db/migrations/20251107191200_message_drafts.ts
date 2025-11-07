import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'
import { assertOnInsert } from '../helpers.ts'

export async function up(db: Kysely<DB>) {
  // Create enum for target_table_name
  await sql`
    CREATE TYPE message_draft_target_table AS ENUM ('organizations', 'employment', 'profession', 'region')
  `.execute(db)

  // Create message_drafts table
  await createStandardTable(
    db,
    'message_drafts',
    (qb) =>
      qb
        .addColumn('employment_id', 'uuid', (col) =>
          col.notNull().references('employment.id').onDelete('cascade'))
        .addColumn('body', 'text', (col) =>
          col.notNull().defaultTo(''))
        .addColumn('priority', 'text', (col) =>
          col)
        .addColumn('concerning', 'boolean', (col) =>
          col.notNull().defaultTo(false)),
  )

  // Create message_draft_targets table
  await createStandardTable(
    db,
    'message_draft_targets',
    (qb) =>
      qb
        .addColumn('message_draft_id', 'uuid', (col) =>
          col.notNull().references('message_drafts.id').onDelete('cascade'))
        .addColumn('table_name', sql`message_draft_target_table`, (col) =>
          col.notNull())
        .addColumn('target_uuid', 'uuid', (col) =>
          col)
        .addColumn('target_value', 'jsonb', (col) =>
          col)
        .addCheckConstraint(
          'exactly_one_target',
          sql`(target_uuid IS NOT NULL)::int + (target_value IS NOT NULL)::int = 1`,
        )
        .addCheckConstraint(
          'uuid_for_org_and_employment',
          sql`(
            (table_name IN ('organizations', 'employment') AND target_uuid IS NOT NULL)
            OR
            (table_name NOT IN ('organizations', 'employment'))
          )`,
        )
        .addCheckConstraint(
          'value_for_profession_and_region',
          sql`(
            (table_name IN ('profession', 'region') AND target_value IS NOT NULL)
            OR
            (table_name NOT IN ('profession', 'region'))
          )`,
        ),
  )

  await db.schema.createIndex('message_draft_targets_message_draft_id_index')
    .on('message_draft_targets')
    .column('message_draft_id')
    .execute()

  // Add assertion triggers for target_uuid existence
  const org_assertion = assertOnInsert({
    table: 'message_draft_targets',
    function_name: 'assert_org_exists_for_draft_target',
    assertion: `
      NEW.table_name != 'organizations' OR
      EXISTS (SELECT 1 FROM organizations WHERE id = NEW.target_uuid)
    `,
    error_message: `'Organization with specified target_uuid does not exist'`,
  })
  await org_assertion.up(db)

  const employment_assertion = assertOnInsert({
    table: 'message_draft_targets',
    function_name: 'assert_employment_exists_for_draft_target',
    assertion: `
      NEW.table_name != 'employment' OR
      EXISTS (SELECT 1 FROM employment WHERE id = NEW.target_uuid)
    `,
    error_message: `'Employment with specified target_uuid does not exist'`,
  })
  await employment_assertion.up(db)
}

export async function down(db: Kysely<DB>) {
  // Drop assertion triggers first
  await sql`DROP TRIGGER IF EXISTS assert_employment_exists_for_draft_target_trigger ON message_draft_targets`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS assert_employment_exists_for_draft_target()`
    .execute(db)
  await sql`DROP TRIGGER IF EXISTS assert_org_exists_for_draft_target_trigger ON message_draft_targets`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS assert_org_exists_for_draft_target()`
    .execute(db)

  // Drop tables in reverse order
  await db.schema.dropTable('message_draft_targets').execute()
  await db.schema.dropTable('message_drafts').execute()

  // Drop enum
  await sql`DROP TYPE message_draft_target_table`.execute(db)
}
