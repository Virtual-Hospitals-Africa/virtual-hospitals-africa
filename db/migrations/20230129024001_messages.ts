import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'message_threads',
    (qb) => qb,
  )

  await createStandardTable(
    db,
    'message_thread_subjects',
    (qb) =>
      qb
        .addColumn('thread_id', 'uuid', (col) => col.notNull().references('message_threads.id'))
        .addColumn('table_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('row_id', 'uuid', (col) => col.notNull()),
  )

  await createStandardTable(
    db,
    'message_thread_participants',
    (qb) =>
      qb
        .addColumn('thread_id', 'uuid', (col) => col.notNull().references('message_threads.id'))
        .addColumn('table_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('row_id', 'uuid', (col) => col.notNull()),
  )

  await createStandardTable(
    db,
    'messages',
    (qb) =>
      qb
        .addColumn('thread_id', 'uuid', (col) => col.notNull().references('message_threads.id'))
        .addColumn('is_from_system', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('sender_participant_id', 'uuid', (col) => col.references('message_thread_participants.id'))
        .addColumn('body', 'text', (col) => col.notNull())
        .addCheckConstraint(
          'system_or_sender',
          sql`is_from_system or sender_participant_id is not null`,
        ),
  )

  await createStandardTable(
    db,
    'message_reads',
    (qb) =>
      qb
        .addColumn('message_id', 'uuid', (col) => col.notNull().references('message_threads.id'))
        .addColumn('participant_id', 'uuid', (col) => col.notNull().references('message_thread_participants.id')),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('message_reads').execute()
  await db.schema.dropTable('messages').execute()
  await db.schema.dropTable('message_thread_participants').execute()
  await db.schema.dropTable('message_thread_subjects').execute()
  await db.schema.dropTable('message_threads').execute()
}
