import { Kysely, sql } from "kysely";
import selectAllNonMetaTables from "../selectAllNonMetaTables.ts";


export function addUpdatedAtTrigger(db: Kysely<unknown>, table: string) {
  return sql`
    CREATE TRIGGER update_updated_at_trigger
           BEFORE UPDATE ON ${sql.id(table)}
           FOR EACH ROW
           EXECUTE FUNCTION update_updated_at();
  `.execute(db)
}

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
  `.execute(db)

  const tables = await selectAllNonMetaTables(db)
  
  for (const table of tables) {
    await addUpdatedAtTrigger(db, table);
  }
}

export async function down(db: Kysely<unknown>) {
  const tables = await selectAllNonMetaTables(db)
  for (const table of tables){
    await sql`
      DROP TRIGGER IF EXIST update_updated_at_trigger
        ON ${sql.id(table)}
    `.execute(db)
  }
}
