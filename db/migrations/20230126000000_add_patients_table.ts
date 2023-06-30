import { Kysely, sql } from 'kysely'
import patientConversationStates from '../../chatbot/patient/conversationStates.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  const conversationStates = Object.keys(patientConversationStates)

  await db.schema
    .createType('patient_conversation_state')
    .asEnum(conversationStates)
    .execute()

  await db.schema
    .createTable('patients')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('phone_number', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)')
    .addColumn('gender', 'varchar(50)')
    .addColumn('date_of_birth', 'varchar(50)')
    .addColumn('national_id_number', 'varchar(50)')
    .addColumn('avatar_url', 'varchar(255)')
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
    .addColumn(
      'nearest_facility_id',
      'integer',
      (col) => col.references('facilities.id'),
    )
    .addColumn(
      'conversation_state',
      sql`patient_conversation_state`,
      (column) => column.defaultTo('initial_message'),
    )
    .addUniqueConstraint('national_id_number', ['national_id_number'])
    .addUniqueConstraint('phone_number', ['phone_number'])
    .execute()

  await addUpdatedAtTrigger(db, 'patients')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patients').execute()
  await db.schema.dropType('patient_conversation_state').execute()
}
