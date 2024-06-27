import { Kysely, sql } from 'kysely'
import * as defs from '../../chatbot/defs.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  // await db.schema
  //   .createType('patient_conversation_state')
  //   .asEnum(Object.keys(defs.patient.conversation_states))
  //   .execute()

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
        // .addColumn('conversation_state', sql`patient_conversation_state`),
        .addColumn('conversation_state', 'varchar(255)'),
  )

  // await db.schema
  //   .createType('pharmacist_conversation_state')
  //   .asEnum(Object.keys(defs.pharmacist.conversation_states))
  //   .execute()

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
          (col) => col.references('pharmacists.id').onDelete('cascade'),
        )
        // .addColumn('conversation_state', sql`pharmacist_conversation_state`),
        .addColumn('conversation_state', 'varchar(255)'),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacist_whatsapp_messages_received').execute()
  await db.schema.dropType('pharmacist_conversation_state').execute()

  await db.schema.dropTable('patient_whatsapp_messages_received').execute()
  await db.schema.dropType('patient_conversation_state').execute()
}
