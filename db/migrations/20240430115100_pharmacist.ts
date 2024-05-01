import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'
import conversationStates from '../../chatbot/pharmacist/conversationStates.ts'

export async function up(db: Kysely<unknown>) {
  const pharmacistState = Object.keys(conversationStates)

  await db.schema
    .createType('pharmacist_conversation_state')
    .asEnum(pharmacistState)
    .execute()

  return createStandardTable(db, 'pharmacists', (table) =>
    table
      .addColumn('registration_number', 'varchar(255)')
      .addColumn('phone_number', 'varchar(255)')
      .addColumn('id_number', 'varchar(255)')
      .addColumn('name', 'varchar(255)')
      .addColumn(
        'conversation_state',
        sql`pharmacist_conversation_state`,
        (column) => column.notNull().defaultTo('initial_message'),
      )
      .addColumn('pin', 'varchar(255)'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_lifestyle').execute()
}
