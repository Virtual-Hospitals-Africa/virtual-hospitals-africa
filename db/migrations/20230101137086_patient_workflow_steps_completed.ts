import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'patient_workflows_started',
    (qb) =>
      qb.addColumn(
        'patient_workflow_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_workflows.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'patient_encounter_employee_id',
          'uuid',
          (col) =>
            col.notNull().references(`patient_encounter_employees.id`).onDelete(
              'cascade',
            ),
        )
        .addUniqueConstraint('patient_workflows_started_once', [
          'patient_workflow_id',
          'patient_encounter_employee_id',
        ]),
  )
  await createStandardTable(
    db,
    'patient_workflow_steps_completed',
    (qb) =>
      qb.addColumn(
        'patient_workflow_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_workflows.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'workflow_step',
          'varchar(255)',
          (col) => col.notNull().references(`workflow_steps.workflow_step`),
        )
        .addUniqueConstraint(`patient_workflow_step_once`, [
          'patient_workflow_id',
          'workflow_step',
        ]),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_workflow_steps_completed').execute()
  await db.schema.dropTable('patient_workflows_started').execute()
}
