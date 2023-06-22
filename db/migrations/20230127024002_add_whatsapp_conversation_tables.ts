import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('whatsapp_messages_received')
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
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn(
      'started_responding_at',
      'timestamp',
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
      (col) => col.notNull(),
    )
    .addColumn(
      'conversation_state',
      sql`patient_conversation_state`,
      (col) => col.defaultTo('initial_message'),
    )
    .execute()

  await db.schema
    .createTable('whatsapp_messages_sent')
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
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn(
      'responding_to_id',
      'integer',
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
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('whatsapp_messages_sent').execute()
  await db.schema.dropTable('whatsapp_messages_received').execute()
}
