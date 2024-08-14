import { Kysely } from "kysely";
import { createStandardTable } from '../createStandardTable.ts'

  export async function up(db: Kysely<unknown>) {
    await createStandardTable(db, 'manufactured_medication_recalls', (qb) =>
      qb
        .addColumn('prescriber_id', 'uuid', (col) =>
          col.notNull().references('patient_encounter_providers.id').onDelete(
            'cascade',
          ))
        .addColumn('patient_id', 'uuid', (col) =>
          col.references('patients.id').onDelete('cascade')))
  }

  export function down(db: Kysely<unknown>) {

  }
  