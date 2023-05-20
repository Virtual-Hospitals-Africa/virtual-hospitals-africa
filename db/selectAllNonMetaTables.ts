// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from "kysely";

export default async function selectAllNonMetaTables(
  db: Kysely<any>,
): Promise<string[]> {
  const tables = await sql<{ table_name: string }>`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND table_name NOT LIKE 'kysely_%'
  `.execute(db);

  return tables.rows.map(({ table_name }) => table_name);
}
