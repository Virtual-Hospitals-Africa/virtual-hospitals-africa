import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('clinics')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('name', 'varchar(255)')
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
    .addColumn('longitude', 'double precision')
    .addColumn('latitude', 'double precision')
    .addColumn('address', 'text')
    .addColumn('vha', 'boolean')
    .addColumn('url', 'text')
    .addColumn('phone', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'clinics')

  // Import data from CSV
  // await importDataFromCSV(db, '../dummy.csv');
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('clinics').execute()
}

async function importDataFromCSV(db: Kysely<unknown>, filePath: string) {
  const fileContent = await Deno.readTextFile(filePath)

  const lines = fileContent.split('\n').filter((line) => line.trim() !== '')

  const header = lines[0].split(',')

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',')
    const row: Record<string, string> = {} // Explicitly type the row object
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = columns[j]
    }

    await sql`
      INSERT INTO clinics (
        name,
        location,
        longitude,
        latitude,
        address,
        vha,
        url,
        phone
      ) VALUES (
        ${row['name']},
        ST_SetSRID(ST_MakePoint(${row['longitude']}, ${row['latitude']}), 4326),
        ${row['longitude']},
        ${row['latitude']},
        ${row['address']},
        ${row['vha']},
        ${row['url']},
        ${row['phone']}
      )
    `.execute(db)
  }
}
