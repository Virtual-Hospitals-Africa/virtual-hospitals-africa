import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'pharmacist_chatbot_users',
    (qb) =>
      qb.addColumn(
        'entity_id',
        'uuid',
        (col) => col.references('pharmacists.id').onDelete('cascade'),
      )
        .addColumn('phone_number', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('data', 'json', (col) => col.notNull())
        .addColumn(
          'conversation_state',
          'varchar(255)',
          (col) => col.notNull(),
        ),
  )

  await createStandardTable(
    db,
    'pharmacist_chatbot_user_whatsapp_messages_received',
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
            col.notNull().references('pharmacist_chatbot_users.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'conversation_state',
          'varchar(255)',
          (col) => col.notNull(),
        ),
  )

  await db.schema
    .createIndex('idx_pharmacist_chatbot_users_entity_id')
    .on('pharmacist_chatbot_users')
    .column('entity_id')
    .execute()

  await db.schema
    .createIndex('idx_pharmacist_chatbot_user_whatsapp_messages_received_whatsapp_message_received_id')
    .on('pharmacist_chatbot_user_whatsapp_messages_received')
    .column('whatsapp_message_received_id')
    .execute()

  await db.schema
    .createIndex('idx_pharmacist_chatbot_user_whatsapp_messages_received_chatbot_user_id')
    .on('pharmacist_chatbot_user_whatsapp_messages_received')
    .column('chatbot_user_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable(
    'pharmacist_chatbot_user_whatsapp_messages_received',
  ).execute()
  await db.schema.dropTable('pharmacist_chatbot_users').execute()
}
