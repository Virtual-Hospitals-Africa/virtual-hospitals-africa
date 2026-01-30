import { Kysely } from "kysely"
import { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return db.schema.alterTable('patient_evaluations').alterColumn('evaluates_record_id', col => col.dropNotNull()).execute()
}

export function down(db: Kysely<DB>){
  return db.schema.alterTable('patient_evaluations').alterColumn('evaluates_record_id', col => col.setNotNull()).execute()
}
