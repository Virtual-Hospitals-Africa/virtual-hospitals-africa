import { Kysely, sql } from 'kysely'
import { GUARDIAN_RELATIONS } from '../../shared/family.ts'
import { createStandardTable } from '../createStandardTable.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createType('guardian_relation')
    .asEnum(GUARDIAN_RELATIONS.map(({ guardian }) => guardian))
    .execute()

  await db.schema
    .createTable('guardian_relations')
    .addColumn('guardian', sql`guardian_relation`, (col) => col.primaryKey())
    .addColumn('dependent', 'varchar(255)', (col) => col.notNull())
    .addColumn('female_guardian', 'varchar(255)')
    .addColumn('male_guardian', 'varchar(255)')
    .addColumn('female_dependent', 'varchar(255)')
    .addColumn('male_dependent', 'varchar(255)')
    .execute()

  await db.insertInto('guardian_relations').values(GUARDIAN_RELATIONS).execute()

  await createStandardTable(db, 'patient_guardians', (qb) =>
    qb.addColumn(
      'guardian_relation',
      sql`guardian_relation`,
      (col) =>
        col.notNull().references('guardian_relations.guardian').onDelete(
          'cascade',
        ),
    )
      .addColumn(
        'guardian_patient_id',
        'uuid',
        (col) => col.notNull().references('Patient.id').onDelete('cascade'),
      )
      .addColumn(
        'dependent_patient_id',
        'uuid',
        (col) => col.notNull().references('Patient.id').onDelete('cascade'),
      )
      .addUniqueConstraint(
        'one_relationship_per_pair',
        ['guardian_patient_id', 'dependent_patient_id'],
      )
      .addCheckConstraint(
        'no_relationship_to_self',
        sql`
      guardian_patient_id != dependent_patient_id
    `,
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_guardians').execute()
  await db.schema.dropTable('guardian_relations').execute()
  await db.schema.dropType('guardian_relation').execute()
}
