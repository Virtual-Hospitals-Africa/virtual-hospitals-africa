import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_chatbot_users',
    (qb) =>
      qb.addColumn(
        'entity_id',
        'uuid',
        (col) => col.references('Patient.id').onDelete('cascade'),
      )
        .addColumn('phone_number', 'varchar(255)', (col) =>
          col.notNull().unique())
        .addColumn('data', 'json', (col) =>
          col.notNull())
        .addColumn(
          'conversation_state',
          'varchar(255)',
          (col) =>
            col.notNull(),
        ),
  )

  await createStandardTable(
    db,
    'patient_chatbot_user_whatsapp_messages_received',
    (qb) =>
      qb.addColumn(
        'whatsapp_message_received_id',
        'uuid',
        (col) =>
          col.notNull().references('whatsapp_messages_received.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'chatbot_user_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_chatbot_users.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'conversation_state',
          'varchar(255)',
          (col) => col.notNull(),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_chatbot_user_whatsapp_messages_received')
    .execute()
  await db.schema.dropTable('patient_chatbot_users').execute()
}
