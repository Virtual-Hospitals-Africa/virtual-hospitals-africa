import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { GuardianRelationName } from '../../types.ts'

type UngenderedRelation = [GuardianRelationName, string]
type GenderedRelation = [
  GuardianRelationName,
  string,
  [string, string],
  [string, string],
]
type Relation = UngenderedRelation | GenderedRelation

const relations: Relation[] = [
  ['biological parent', 'biological child', [
    'biological mother',
    'biological father',
  ], ['biological daughter', 'biological son']],
  ['grandparent', 'grandchild', ['grandmother', 'grandfather'], [
    'granddaughter',
    'grandson',
  ]],
  ['sibling', 'sibling', ['sister', 'brother'], ['sister', 'brother']],
  ['sibling of parent', 'child of sibling', ['aunt', 'uncle'], [
    'niece',
    'nephew',
  ]],
  ['other guardian', 'other relative'],
  ['foster parent', 'foster child', ['foster mother', 'foster father'], [
    'foster daughter',
    'foster son',
  ]],
  ['adopted parent', 'adopted child', ['adopted mother', 'adopted father'], [
    'adopted daughter',
    'adopted son',
  ]],
]

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('guardian_relations')
    .addColumn('guardian', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('dependent', 'varchar(255)', (col) => col.notNull())
    .addColumn('female_guardian', 'varchar(255)')
    .addColumn('male_guardian', 'varchar(255)')
    .addColumn('female_dependent', 'varchar(255)')
    .addColumn('male_dependent', 'varchar(255)')
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
    .execute()

  await db.schema
    .createTable('patient_guardians')
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
    .addColumn(
      'guardian_relation',
      'varchar(255)',
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
    .execute()

  await addUpdatedAtTrigger(db, 'guardian_relations')
  await addUpdatedAtTrigger(db, 'patient_guardians')

  const familyRelations = relations.map((
    [guardian, dependent, gendered_guardian, gendered_dependent],
  ) => ({
    guardian,
    dependent,
    female_guardian: gendered_guardian?.[0] ?? null,
    male_guardian: gendered_guardian?.[1] ?? null,
    female_dependent: gendered_dependent?.[0] ?? null,
    male_dependent: gendered_dependent?.[1] ?? null,
  }))

  await db.insertInto('guardian_relations').values(familyRelations).execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_guardians').execute()
  await db.schema.dropTable('guardian_relations').execute()
}
