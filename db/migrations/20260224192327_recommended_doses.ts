import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('prescriber')
    .asEnum([
      'Dentist, Dental therapist',
      'Dentist',
      'Doctor prescribed',
      'Doctor',
      'Doctor/Nurse',
      'Nurse',
      'Specialist advice',
      'Specialist consultation',
      'Specialist initiated',
      'Specialist prescribed',
      'Specialist supervision',
      'Specialist',
      'Specialist/subspecialist supervision',
      'Subspecialist initiated',
      'Subspecialist supervision',
      'N/A',
    ])
    .execute()

  await createStandardTable(
    db,
    'recommended_doses',
    (qb) =>
      qb
        .addColumn('regulatory_agency_id', 'uuid', (col) => col.references('regulatory_agencies.id').onDelete('cascade').notNull())
        .addColumn('atc', 'varchar(64)', (col) => col.notNull())
        .addColumn('medicine_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade').notNull())
        .addColumn('form_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade').notNull())
        .addColumn('route_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade').notNull())
        .addColumn('age_years_min', 'int8', (col) => col.notNull())
        .addColumn('age_years_max', 'int8')
        .addColumn('special_instructions', 'text')
        .addColumn('prescriber', sql`prescriber`, (col) => col.notNull())
        .addCheckConstraint('age_range_sensible', sql`(age_years_max is null) or (age_years_max > age_years_min)`),
  )

  await createStandardTable(
    db,
    'recommended_dose_schedules',
    (qb) =>
      qb.addColumn('recommended_dose_id', 'uuid', (col) => col.references('recommended_doses.id').onDelete('cascade').notNull())
        .addColumn('frequencies', sql`medication_frequency[]`, (col) => col.notNull())
        .addColumn('dosage_min', 'decimal')
        .addColumn('dosage_max', 'decimal')
        .addColumn('dosage_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
        .addColumn('interval_exact', 'decimal')
        .addColumn('interval_low', 'decimal')
        .addColumn('interval_high', 'decimal')
        .addColumn('interval_units', sql`duration_units`)
        .addColumn('duration', 'integer')
        .addColumn('duration_unit', sql`duration_units`)
        .addColumn('order', 'smallint', (col) => col.notNull())
        .addUniqueConstraint('dose_schedules_in_order', ['recommended_dose_id', 'order'])
        .addCheckConstraint('frequencies_has_length', sql`cardinality(frequencies) > 1`)
        .addCheckConstraint(
          'recommended_dose_schedule_has_defined_dosage_or_as_needed',
          sql`
            (dosage is not null and duration is not null and duration_unit is not null) OR
            (frequency in ('qs', 'stat', 'prn'))
        `,
        ),
  )

  // await createStandardTable(
  //   db,
  //   'recommended_dose_ingredients',
  //   (qb) =>
  //     qb.addColumn('recommended_dose_schedule_id', 'uuid', (col) => col.references('recommended_dose_schedules.id').onDelete('cascade').notNull())
  //       .addColumn('active_ingredient_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade').notNull()),
  // )

  // await createPointerTable(
  //   db,
  //   'recommended_dose_ingredient_strengths',
  //   {
  //     references: 'recommended_dose_ingredients',
  //     primary_key_type: 'uuid',
  //   },
  //   (qb) =>
  //     qb.addColumn('units_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
  //       .addColumn('value', 'decimal')
  //       .addColumn('value_low', 'decimal')
  //       .addColumn('value_high', 'decimal')
  //       .addCheckConstraint(
  //         'recommended_dose_ingredient_strengths_value_or_range',
  //         sql`
  //           (value is not null and value_low is null and value_high is null) or
  //           (value is null and value_low is not null and value_high is not null)
  //         `,
  //       ),
  // )

  await createStandardTable(
    db,
    'recommended_dose_indications',
    (qb) =>
      qb.addColumn('recommended_dose_id', 'uuid', (col) => col.references('recommended_doses.id').onDelete('cascade').notNull())
        .addColumn('indication_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade').notNull()),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('recommended_dose_indications').ifExists().execute()
  await db.schema.dropTable('recommended_dose_ingredient_strengths').ifExists().execute()
  await db.schema.dropTable('recommended_dose_ingredients').ifExists().execute()
  await db.schema.dropTable('recommended_dose_schedules').ifExists().execute()
  await db.schema.dropTable('recommended_doses').ifExists().execute()
  await db.schema.dropType('prescriber').ifExists().execute()
}
