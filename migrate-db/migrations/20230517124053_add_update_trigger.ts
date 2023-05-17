import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>) {
  const tables = await sql<{table_name: string}>
  `SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'`
    .execute(db)
    
  for (const {table_name} of tables.rows){
      await sql
      `CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$ 
      BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
      END;
      $$
      LANGUAGE plpgsql;
      `.execute(db)
      await sql`
      CREATE TRIGGER update_updated_at_trigger
            BEFORE UPDATE ON ${sql.id(table_name)}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
            `.execute(db)
    }
}

export async function down(db: Kysely<unknown>) {
  const tables = await sql<{table_name: string}>
  `SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'`
    .execute(db)
  for (const {table_name} of tables.rows){
    await sql
    `DROP TRIGGER IF EXIST update_updated_at_trigger
      ON ${sql.id(table_name)}`.execute(db)
  }

}