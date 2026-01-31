import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return db.schema.alterTable('patient_procedures').addColumn('form_label', 'text').execute()
}

export function down(db: Kysely<DB>) {
  return db.schema.alterTable('patient_procedures').dropColumn('form_label').execute()
}
