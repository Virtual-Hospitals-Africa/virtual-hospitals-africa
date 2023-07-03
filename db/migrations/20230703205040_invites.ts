import { Kysely, sql } from "kysely";
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
    await db.schema
    .createType('health_worker_professions')
    .asEnum([
      'admin',
      'doctor',
      'nurse',
    ])
    .execute()

    await db.schema
    .createTable('invites')
    .addColumn('id', 'serial', (col) => col.primaryKey()) 
    .addColumn('email', 'text', (col) => 
      col.notNull()
         .onDelete('cascade'))
    .addColumn('facility_id', 'integer', (col) =>
      col.notNull()
        .references('facilities.id')
        .onDelete('cascade'))
    .addColumn(
      'profession',
      sql`health_worker_professions`,
      (column) => column.notNull(),
    )
    .addColumn(
        'invite_code',
        sql`integer`,
        (column) => column.notNull(),
      )
    .execute()
  await addUpdatedAtTrigger(db, 'invites')
}

export async function down(db: Kysely<unknown>) {
    await db.schema.dropTable('invites').execute()
    await db.schema.dropType('health_worker_professions').execute()
}
