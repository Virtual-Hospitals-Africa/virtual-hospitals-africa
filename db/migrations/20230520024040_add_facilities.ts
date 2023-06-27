import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { readCSV } from 'https://deno.land/x/csv@v0.8.0/mod.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('facilities')
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

  await addUpdatedAtTrigger(db, 'facilities')

  // Import data from CSV file
  await importDataFromCSV(db, './db/resources/zimbabwe-health-facilities.csv')
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('facilities').execute()
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<unknown>, filePath: string) {
  const file = await Deno.open(filePath)

  let header: string[] = []
  let isFirstRow = true

  for await (const row of readCSV(file)) {
    // Collecting data from the async iterable row into an array
    const rowDataArray: string[] = []
    for await (const cell of row) {
      rowDataArray.push(cell)
    }

    if (isFirstRow) {
      // Assuming the first row of the CSV contains the header
      header = rowDataArray
      isFirstRow = false
      continue
    }

    const rowData: Record<string, string> = {}

    for (let i = 0; i < header.length; i++) {
      rowData[header[i]] = rowDataArray[i]
    }

    await sql`
      INSERT INTO facilities (
        name,
        location,
        longitude,
        latitude,
        address,
        vha,
        url,
        phone
      ) VALUES (
        ${rowData['name']},
        ST_SetSRID(ST_MakePoint(${rowData['longitude']}, ${
      rowData['latitude']
    }), 4326),
        ${rowData['longitude']},
        ${rowData['latitude']},
        ${rowData['address']},
        ${rowData['vha']},
        ${rowData['url']},
        ${rowData['phone']}
      )
    `.execute(db)
  }

  file.close()
}
