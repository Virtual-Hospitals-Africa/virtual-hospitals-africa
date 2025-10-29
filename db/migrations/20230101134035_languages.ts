import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

// type Language = {
//     iso_639_3: string | null;
//     iso_639_5: string | null;
//     iso_639_1: string | null;
//     language_names: string[];
//     type: "Special" | "Living" | "Genetic" | "Constructed" | "Historical" | "Genetic-like" | "Geographic" | "Extinct" | null;
//     scope: "Individual" | "Macrolanguage" | "Special" | "Collective" | "Local" | null;
//     native_names: string[] | null;
//     other_names: string | null;
//     iso_639_2_1: string;
//     iso_639_2_1: string;
// }

export async function up(db: Kysely<DB>) {
  await db.schema.createType('language_scope').asEnum([
    'Individual',
    'Macrolanguage',
    'Special',
    'Collective',
    'Local',
  ]).execute()

  await db.schema.createType('language_type').asEnum([
    'Living',
    'Genetic',
    'Constructed',
    'Historical',
    'Genetic-like',
    'Geographic',
    'Extinct',
    'Special',
  ]).execute()

  await db.schema
    .createTable('languages')
    .addColumn(
      'iso_639_2_b',
      'varchar(3)',
      (col) => col.primaryKey().check(sql`length(iso_639_2_b) = 3`),
    )
    .addColumn(
      'iso_639_2_t',
      'varchar(3)',
      (col) => col.notNull().check(sql`length(iso_639_2_t) = 3`),
    )
    .addColumn(
      'iso_639_1',
      'varchar(2)',
      (col) => col.check(sql`iso_639_1 is null or length(iso_639_1) = 2`),
    )
    .addColumn('language_names', sql`varchar(255)[]`, (col) => col.notNull())
    .addColumn('scope', sql`language_scope`, (col) => col.notNull())
    .addColumn('type', sql`language_type`, (col) => col.notNull())
    .addColumn('native_names', sql`varchar(255)[]`, (col) => col.notNull())
    .addColumn('other_names', sql`varchar(255)[]`, (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('languages').execute()
  await db.schema.dropType('language_scope').execute()
  await db.schema.dropType('language_type').execute()
}
