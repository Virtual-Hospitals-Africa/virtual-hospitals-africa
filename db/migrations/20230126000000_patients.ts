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
    .createType('gender')
    .asEnum([
      'male',
      'female',
      'non-binary',
    ])
    .execute()

  await db.schema
    .createTable('patients')
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
    .addColumn('phone_number', 'varchar(255)')
    .addColumn('name', 'varchar(255)')
    .addColumn('gender', sql`gender`)
    .addColumn('date_of_birth', 'date')
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
      (column) => column.notNull().defaultTo('initial_message'),
    )
    .addUniqueConstraint('patient_national_id_number', ['national_id_number'])
    .addUniqueConstraint('patient_phone_number', ['phone_number'])
    .addCheckConstraint(
      'patient_national_id_number_format',
      sql`national_id_number IS NULL OR national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
    )
    .execute()

  await addUpdatedAtTrigger(db, 'patients')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patients').execute()
  await db.schema.dropType('patient_conversation_state').execute()
  await db.schema.dropType('gender').execute()
}
