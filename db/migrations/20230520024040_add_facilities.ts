import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import * as google from '../../external-clients/google.ts'
import { readCSV } from 'https://deno.land/x/csv@v0.8.0/mod.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('facility_category')
    .asEnum(['clinic', 'hospital'])
    .execute()

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
    .addColumn('address', 'text')
    .addColumn(
      'category',
      sql`facility_category`,
      (column) => column.defaultTo('clinic'),
    )
    .addColumn('vha', 'boolean')
    .addColumn('url', 'text')
    .addColumn('phone', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'facilities')

  // Import data from CSV file
  await importDataFromCSV(db, './db/resources/zimbabwe-health-facilities.csv')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facilities').execute()
  await db.schema.dropType('facility_category').execute()
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

    const address = await google.getLocationAddress({
      longitude: parseFloat(rowData['longitude']),
      latitude: parseFloat(rowData['latitude']),
    });
    
    await sql`
      INSERT INTO facilities (
        name,
        location,
        address,
        category,
        vha,
        url,
        phone
      ) VALUES (
        ${rowData['name']},
        ST_SetSRID(ST_MakePoint(${rowData['longitude']}, ${
      rowData['latitude']
    }), 4326),
        ${address},
        ${rowData['category']},
        ${rowData['vha']},
        ${rowData['url']},
        ${rowData['phone']}
      )
    `.execute(db)
  }

  file.close()
}
