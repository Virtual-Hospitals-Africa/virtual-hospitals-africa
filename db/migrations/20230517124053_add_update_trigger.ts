import { Kysely, sql } from "kysely";
import { addUpdatedAtTrigger } from "../addUpdatedAtTrigger.ts";
import selectAllNonMetaTables from "../selectAllNonMetaTables.ts";

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$ 
      BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
      END;
      $$
      LANGUAGE plpgsql;
  `.execute(db);

  const tables = await selectAllNonMetaTables(db);

  for (const table of tables) {
    await addUpdatedAtTrigger(db, table);
  }
}

export async function down(db: Kysely<unknown>) {
  const tables = await selectAllNonMetaTables(db);
  for (const table of tables) {
    await sql`
      DROP TRIGGER IF EXIST update_updated_at_trigger
        ON ${sql.id(table)}
    `.execute(db);
  }
}
