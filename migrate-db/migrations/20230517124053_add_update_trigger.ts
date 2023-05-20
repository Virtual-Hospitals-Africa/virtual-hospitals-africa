import { Kysely, sql } from "kysely";


export async function selectAllNonKyselyMetaTables(db: Kysely<unknown>): Promise<string[]> {
  const tables = await sql<{table_name: string}>`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND table_name NOT LIKE 'kysely_%'
  `.execute(db)

  return tables.rows.map(({ table_name }) => table_name);
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

  const tables = await selectAllNonKyselyMetaTables(db)
  
  for (const table of tables) {
    await sql`
      CREATE TRIGGER update_updated_at_trigger
             BEFORE UPDATE ON ${sql.id(table)}
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at();
    `.execute(db)
  }
}

export async function down(db: Kysely<unknown>) {
  const tables = await selectAllNonKyselyMetaTables(db)
  for (const table of tables){
    await sql`
      DROP TRIGGER IF EXIST update_updated_at_trigger
        ON ${sql.id(table)}
    `.execute(db)
  }
}
