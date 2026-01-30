import { Kysely, sql } from "kysely"
import { DB } from '../../db.d.ts'
import { looksLikeSExpression } from '../helpers.ts'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('age_classification')
    .asEnum([
      'adult',
      'older child',
      'younger child'
    ]).execute()

  await db.schema
    .createTable('tasks')
    .addColumn('description', 'varchar(255)', col => col.notNull().primaryKey())
    .addColumn('age_classifications', sql`age_classification[]`, col =>
      col.notNull()
        .check(sql`cardinality(age_classifications) >= 1`)
        .check(sql`cardinality(age_classifications) = cardinality(array(SELECT DISTINCT unnest(age_classifications)))`)
    )
    .addColumn('applies_when', 'text', col => col.notNull().check(looksLikeSExpression('applies_when')))
    .addColumn('procedure', 'text', col => col.notNull().check(looksLikeSExpression('procedure')))
    .addColumn('diagnosis', 'text')
    .execute()

  await createStandardTable(db
  ,'patient_tasks',
  qb =>
    qb
    .addColumn('task_description', 'varchar(255)', col => col.notNull().references('tasks.description'))
    .addColumn('patient_id', 'uuid', col => col.notNull().references('patients.id'))
    .addColumn('patient_encounter_id', 'uuid', col => col.notNull().references('patient_encounters.id'))
  )

await createPointerTable(db
  ,'patient_tasks_completed',
  {
    references: 'patient_tasks',
    primary_key_type: 'uuid'
  },
  qb =>
    qb.addColumn('patient_procedure_id', 'uuid', col => col.notNull().references('patient_procedures.id'))
  )
}

export async function down(db: Kysely<DB>){
  await db.schema.dropTable('patient_tasks_completed').execute()
  await db.schema.dropTable('patient_tasks').execute()
  await db.schema.dropTable('tasks').execute()
  await db.schema.dropType('age_classification').execute()
}
