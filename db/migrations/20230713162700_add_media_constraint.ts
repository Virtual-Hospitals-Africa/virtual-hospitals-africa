// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema.alterTable('whatsapp_messages_received')
    .addColumn(
      'has_media',
      'boolean',
      (col) => col.defaultTo(false),
    )
    .addColumn(
      'media_id',
      'integer',
      (col) => col.references('media.id').onDelete('set default'),
    )
    .execute()

  await sql`
       ALTER TABLE whatsapp_messages_received
    ADD CONSTRAINT check_media_constraints
             CHECK (
              (has_media = true AND body IS NULL AND media_id IS NOT NULL) OR
              (has_media = false AND body IS NOT NULL AND media_id IS NULL)
             )
  `.execute(db)

  await db.schema.alterTable('whatsapp_messages_received').alterColumn(
    'body',
    (col) => col.dropNotNull(),
  ).execute()
}

export async function down(db: Kysely<any>) {
  await db.deleteFrom('whatsapp_messages_received').where(
    'has_media',
    '=',
    true,
  ).execute()

  await db.schema.alterTable('whatsapp_messages_received').alterColumn(
    'body',
    (col) => col.setNotNull(),
  ).execute()

  await db.schema.alterTable('whatsapp_messages_received').dropConstraint(
    'check_media_constraints',
  ).execute()

  await db.schema.alterTable('whatsapp_messages_received').dropColumn(
    'media_id',
  ).dropColumn('has_media').execute()
}
