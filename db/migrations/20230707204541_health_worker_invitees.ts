import { Kysely, sql } from "kysely";
import { addUpdatedAtTrigger } from "../addUpdatedAtTrigger.ts";

export async function up(db: Kysely<unknown>) {
    await db.schema
        .createTable('health_worker_invitees')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('email','varchar(255)', (col) => col.notNull())
        .addColumn('facility_id', 'integer', (col) => 
            col.notNull()
            .references('facilities.id')
            .onDelete('cascade')
        )
        .addColumn(
            'profession',
            sql`health_worker_professions`,
            (col) => col.notNull(),
          )
        .addUniqueConstraint('only_invited_once_per_profession', [
            'email',
            'facility_id',
            'profession',
          ])
        .execute()

        await addUpdatedAtTrigger(db, 'health_worker_invitees')
}

export async function down(db: Kysely<unknown>) {
    await db.schema
        .dropTable('health_worker_invitees').execute()
}
