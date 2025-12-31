import { Kysely, sql } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_events',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb.addColumn(
        'datetime',
        'timestamptz',
        (col) => col.notNull(),
      ).addColumn(
        'address_id',
        'uuid',
        (col) => col.references('addresses.id'),
      ).addColumn(
        'location',
        sql`GEOGRAPHY(POINT,4326)`,
      ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_events').execute()
}
