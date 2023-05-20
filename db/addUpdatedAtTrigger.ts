import { Kysely, sql } from "kysely";

export function addUpdatedAtTrigger(db: Kysely<unknown>, table: string) {
  return sql`
    CREATE TRIGGER update_updated_at_trigger
           BEFORE UPDATE ON ${sql.id(table)}
           FOR EACH ROW
           EXECUTE FUNCTION update_updated_at();
  `.execute(db);
}
