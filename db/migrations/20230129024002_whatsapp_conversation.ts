import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('chatbot_name')
    .asEnum([
      'patient',
      'pharmacist',
    ])
    .execute()

  await createStandardTable(
    db,
    'whatsapp_messages_received',
    (qb) =>
      qb.addColumn(
        'sent_by_phone_number',
        'varchar(255)',
        (col) => col.notNull(),
      )
        .addColumn(
          'chatbot_name',
          sql`chatbot_name`,
          (col) => col.notNull(),
        )
        .addColumn(
          'received_by_phone_number',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn(
          'started_responding_at',
          'timestamptz',
        )
        .addColumn(
          'error_commit_hash',
          'varchar(255)',
        )
        .addColumn(
          'error_message',
          'text',
        )
        .addColumn(
          'whatsapp_id',
          'varchar(255)',
          (col) => col.notNull().unique(),
        )
        .addColumn(
          'body',
          'text',
        )
        .addColumn(
          'has_media',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'media_id',
          'uuid',
          (col) => col.references('media.id').onDelete('set default'),
        )
        .addCheckConstraint(
          'has_body_or_media',
          sql`(
           (has_media = true AND body IS NULL AND media_id IS NOT NULL) OR
           (has_media = false AND body IS NOT NULL AND media_id IS NULL)
        )`,
        ),
  )

  await sql`
    CREATE INDEX whatsapp_messages_received_by_sent_by_phone_number_index ON whatsapp_messages_received (chatbot_name, sent_by_phone_number);
    CREATE INDEX whatsapp_messages_received_by_sent_by_phone_number_created_at_index ON whatsapp_messages_received (chatbot_name, sent_by_phone_number, created_at);
  `.execute(db)

  await createStandardTable(
    db,
    'whatsapp_messages_sent',
    (qb) =>
      qb.addColumn(
        'sent_to_phone_number',
        'varchar(255)',
        (col) => col.notNull(),
      )
        .addColumn(
          'sent_by_phone_number',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn('chatbot_name', sql`chatbot_name`, (col) => col.notNull())
        .addColumn(
          'responding_to_received_id',
          'uuid',
          (col) =>
            col.notNull().references('whatsapp_messages_received.id')
              .onDelete(
                'cascade',
              ),
        )
        .addColumn(
          'whatsapp_id',
          'varchar(255)',
          (col) => col.notNull().unique(),
        )
        .addColumn(
          'body',
          'text',
          (col) => col.notNull(),
        )
        .addColumn(
          'read_status',
          'varchar(255)',
          (col) => col.notNull(),
        ),
  )

  await sql`
    CREATE INDEX whatsapp_messages_sent_phone_number_index ON whatsapp_messages_sent (chatbot_name, sent_to_phone_number);
    CREATE INDEX whatsapp_messages_sent_phone_number_created_at_index ON whatsapp_messages_sent (chatbot_name, sent_to_phone_number, created_at);
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('whatsapp_messages_sent').execute()
  await db.schema.dropTable('whatsapp_messages_received').execute()
  await db.schema.dropType('chatbot_name').execute()
}
