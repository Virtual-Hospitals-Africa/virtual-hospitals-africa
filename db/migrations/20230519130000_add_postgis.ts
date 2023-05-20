import { Kysely, sql } from "kysely";

export function up(db: Kysely<unknown>) {
  return sql`CREATE EXTENSION POSTGIS;`.execute(db);
}

export function down(db: Kysely<unknown>) {
  return sql`DROP EXTENSION POSTGIS;`.execute(db);
}
