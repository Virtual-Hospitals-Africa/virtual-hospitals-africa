import { Kysely, sql } from "kysely";

export function up(db: Kysely<unknown>) {
  return db.schema
    .createTable("clinics")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn(
      "created_at",
      "timestamp",
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      "updated_at",
      "timestamp",
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("name", "varchar(255)")
    .addColumn("location", sql`GEOGRAPHY(POINT,4326)`)
    .execute();
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable("clinics");
}
