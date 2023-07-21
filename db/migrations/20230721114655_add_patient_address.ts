import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .alterTable('patients')
    .addColumn('country', 'varchar(255)')
    .addColumn('province', 'varchar(255)')
    .addColumn('district', 'varchar(255)')
    .addColumn('ward', 'varchar(255)')
    .addColumn('street', 'varchar(255)')
    .execute()
}

export async function down(db: Kysely<unknown>) {
   await db
    .schema
    .alterTable('patients')
    .dropColumn('country')
    .dropColumn('province')
    .dropColumn('district')
    .dropColumn('ward')
    .dropColumn('street')
    .execute()
}
