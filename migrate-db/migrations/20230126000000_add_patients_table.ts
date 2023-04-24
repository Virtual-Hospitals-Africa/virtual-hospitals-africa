import { Kysely, sql } from "kysely";

export function up(db: Kysely<any>) {
  return db.schema
    .createTable("patients")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn(
      "created_at",
      "timestamp",
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("phone_number", "varchar(255)", (col) => col.notNull())
    .addColumn("name", "varchar(255)")
    .addColumn("gender", "varchar(50)")
    .addColumn("date_of_birth", "varchar(50)")
    .addColumn("national_id_number", "varchar(50)")
    .addColumn("conversation_state", "varchar(255)")
    .addUniqueConstraint("national_id_number", ["national_id_number"])
    .addUniqueConstraint("phone_number", ["phone_number"])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("patients");
}
