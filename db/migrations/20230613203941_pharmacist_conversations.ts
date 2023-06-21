import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('pharmacist_conversation_state')
    .asEnum([
      'initial_message',
      'not_onboarded:welcome',
      'other_end_of_demo',
    ])
    .execute()

  await db.schema
    .createTable('pharmacists')
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
    .addColumn(
      'conversation_state',
      sql`pharmacist_conversation_state`,
      (column) => column.defaultTo('initial_message'),
    )
    .addUniqueConstraint('pharmacist_phone_number', ['phone_number'])
    .execute()

  await db.schema
    .createTable('pharmacist_whatsapp_messages_received')
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
      'pharmacist_id',
      'integer',
      (col) => col.notNull().references('pharmacists.id').onDelete('cascade'),
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
      sql`conversation_state`,
      (col) => col.defaultTo('initial_message'),
    )
    .execute()

  await db.schema
    .createTable('pharmacist_whatsapp_messages_sent')
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

  await addUpdatedAtTrigger(db, 'pharmacists')
  await addUpdatedAtTrigger(db, 'pharmacist_whatsapp_messages_received')
  await addUpdatedAtTrigger(db, 'pharmacist_whatsapp_messages_sent')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacist_whatsapp_messages_sent').execute()
  await db.schema.dropTable('pharmacist_whatsapp_messages_received').execute()
  await db.schema.dropTable('pharmacists').execute()
  await db.schema.dropType('pharmacist_conversation_state').execute()
}
