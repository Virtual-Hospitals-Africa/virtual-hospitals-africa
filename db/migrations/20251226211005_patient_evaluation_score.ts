import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createPointerTable(db, 'patient_evaluation_scores', {
    references: 'patient_evaluations',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn(
      'score',
      'integer',
      (col) => col.notNull().check(sql`score >= 0`),
    ))
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_evaluation_scores').execute()
}
