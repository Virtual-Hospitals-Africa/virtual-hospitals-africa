import { Kysely, sql } from 'kysely'
import patientConversationStates from '../../chatbot/patient/conversationStates.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('patient_conversation_state')
    .asEnum(Object.keys(patientConversationStates))
    .execute()

  await createStandardTable(
    db,
    'patient_whatsapp_messages_received',
    (qb) =>
      qb.addColumn(
        'whatsapp_message_received_id',
        'uuid',
        (col) =>
          col.references('whatsapp_messages_received.id').onDelete('cascade'),
      )
        .addColumn(
          'patient_id',
          'uuid',
          (col) => col.references('patients.id').onDelete('cascade'),
        )
        .addColumn('conversation_state', sql`patient_conversation_state`),
  )

  await db.schema
    .createType('pharmacist_conversation_state')
    .asEnum(Object.keys(pharmacistConversationStates))
    .execute()

  await createStandardTable(
    db,
    'pharmacist_whatsapp_messages_received',
    (qb) =>
      qb.addColumn(
        'whatsapp_message_received_id',
        'uuid',
        (col) =>
          col.references('whatsapp_messages_received.id').onDelete('cascade'),
      )
        .addColumn(
          'pharmacist_id',
          'uuid',
          (col) => col.references('patients.id').onDelete('cascade'),
        )
        .addColumn('conversation_state', sql`pharmacist_conversation_state`),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacist_whatsapp_messages_received')
  await db.schema.dropType('pharmacist_conversation_state')

  await db.schema.dropTable('patient_whatsapp_messages_received')
  await db.schema.dropType('patient_conversation_state')
}
