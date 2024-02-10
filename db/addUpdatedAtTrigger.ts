import { Kysely, sql } from 'kysely'

// deno-lint-ignore no-explicit-any
export function addUpdatedAtTrigger(db: Kysely<any>, table: string) {
  return sql`
    CREATE TRIGGER update_updated_at_trigger
           BEFORE UPDATE ON ${sql.id(table)}
           FOR EACH ROW
           EXECUTE FUNCTION update_updated_at();
  `.execute(db)
}
