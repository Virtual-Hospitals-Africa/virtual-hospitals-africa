import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { GUARDIAN_RELATIONS } from '../../shared/family.ts'

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
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('patient_guardians')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'guardian_relation',
      sql`guardian_relation`,
      (col) =>
        col.notNull().references('guardian_relations.guardian').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'guardian_patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn(
      'dependent_patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
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
    )
    .execute()

  await addUpdatedAtTrigger(db, 'guardian_relations')
  await addUpdatedAtTrigger(db, 'patient_guardians')

  await db.insertInto('guardian_relations').values(GUARDIAN_RELATIONS).execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_guardians').execute()
  await db.schema.dropTable('guardian_relations').execute()
  await db.schema.dropType('guardian_relation').execute()
}
