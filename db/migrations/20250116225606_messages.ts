import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
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
        .addColumn('thread_id', 'uuid', (col) =>
          col.notNull().references('message_threads.id'))
        .addColumn('table_name', 'varchar(255)', (col) =>
          col.notNull())
        .addColumn('row_id', 'uuid', (col) =>
          col.notNull()),
  )

  await createStandardTable(
    db,
    'message_thread_participants',
    (qb) =>
      qb
        .addColumn('thread_id', 'uuid', (col) =>
          col.notNull().references('message_threads.id'))
        .addColumn('health_worker_id', 'uuid', (col) =>
          col.references('health_workers.id'))
        .addColumn('pharmacist_id', 'uuid', (col) =>
          col.references('pharmacists.id'))
        .addCheckConstraint(
          'pharmacist_or_health_worker',
          sql`(
          (health_worker_id is not null and pharmacist_id is null) or
          (health_worker_id is null and pharmacist_id is not null)
        )`,
        ),
  )

  await createStandardTable(
    db,
    'messages',
    (qb) =>
      qb
        .addColumn('thread_id', 'uuid', (col) =>
          col.notNull().references('message_threads.id'))
        .addColumn('is_from_system', 'boolean', (col) =>
          col.notNull().defaultTo(false))
        .addColumn('sender_id', 'uuid', (col) =>
          col.references('message_thread_participants.id'))
        .addColumn('body', 'text', (col) =>
          col.notNull())
        .addCheckConstraint(
          'system_or_sender',
          sql`is_from_system or sender_id is not null`,
        ),
  )

  await createStandardTable(
    db,
    'message_read_status',
    (qb) =>
      qb
        .addColumn('message_id', 'uuid', (col) =>
          col.notNull().references('message_threads.id'))
        .addColumn('participant_id', 'uuid', (col) =>
          col.notNull().references('message_thread_participants.id'))
        .addColumn('read_at', 'timestamptz'),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('message_read_status').execute()
  await db.schema.dropTable('messages').execute()
  await db.schema.dropTable('message_thread_participants').execute()
  await db.schema.dropTable('message_thread_subjects').execute()
  await db.schema.dropTable('message_threads').execute()
}
