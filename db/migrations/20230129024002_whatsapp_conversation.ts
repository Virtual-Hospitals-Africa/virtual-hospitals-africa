import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'whatsapp_messages_received',
    (qb) =>
      qb.addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
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
          'conversation_state',
          sql`patient_conversation_state`,
          (col) => col.notNull().defaultTo('initial_message'),
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

  await createStandardTable(db, 'whatsapp_messages_sent', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn(
        'responding_to_id',
        'uuid',
        (col) =>
          col.notNull().references('whatsapp_messages_received.id').onDelete(
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
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('whatsapp_messages_sent').execute()
  await db.schema.dropTable('whatsapp_messages_received').execute()
}
