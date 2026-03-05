import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'medications',
    (qb) =>
      qb.addColumn('trade_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('applicant_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('manufacturer_name', 'varchar(511)', (col) => col.notNull())
        .addColumn('form', 'varchar(255)', (col) => col.notNull())
        .addColumn('routes', sql`varchar(255)[]`, (col) => col.notNull())
        .addColumn(
          'snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'),
        )
        .addCheckConstraint(
          'at_least_one_route_check',
          sql`array_length(routes, 1) >= 1`,
        ),
  )

  await sql`
    ALTER TABLE medications
    ADD form_route TEXT NOT NULL
    GENERATED ALWAYS AS (
      form || (
        CASE WHEN array_length(routes, 1) = 1 
          THEN '; ' || routes[1]
          ELSE ''
        END
      )
    ) STORED
  `.execute(db)

  await createPointerTable(
    db,
    'medication_doses',
    {
      references: 'consumables',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn('medication_id', 'uuid', (col) =>
          col.notNull().references('medications.id').onDelete(
            'cascade',
          ))
        .addColumn('value', 'decimal', (col) => col.notNull())
        .addColumn(
          'units',
          'varchar(255)',
        ).addColumn(
          'description',
          'varchar(255)',
          (col) => col.notNull(),
        ),
  )

  await createStandardTable(
    db,
    'medication_dose_ingredients',
    (qb) =>
      qb.addColumn('medication_dose_id', 'uuid', (col) =>
        col.notNull().references('medication_doses.id').onDelete(
          'cascade',
        ))
        .addColumn('snomed_concept_id', 'bigint', (col) =>
          col.notNull().references('snomed_inferred_canonical_name_and_category.id').onDelete(
            'cascade',
          )),
  )

  await createPointerTable(
    db,
    'medication_dose_ingredient_strengths',
    {
      references: 'medication_dose_ingredients',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'value',
          'decimal',
          (col) => col.notNull(),
        )
        .addColumn(
          'units',
          'varchar(16)',
          (col) => col.notNull(),
        ),
  )

  await createPointerTable(
    db,
    'medication_dose_ingredient_strength_equivalences',
    {
      references: 'medication_dose_ingredient_strengths',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn('snomed_concept_id', 'bigint', (col) =>
          col.notNull().references('snomed_inferred_canonical_name_and_category.id').onDelete(
            'cascade',
          ))
        .addColumn(
          'value',
          'decimal',
          (col) => col.notNull(),
        )
        .addColumn(
          'units',
          'varchar(16)',
          (col) => col.notNull(),
        ),
  )

  await createStandardTable(
    db,
    'medication_availabilities',
    (qb) =>
      qb.addColumn(
        'medication_id',
        'uuid',
        (col) =>
          col.notNull().references('medications.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'registration_number',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn(
          'country',
          'varchar(2)',
          (col) =>
            col.notNull().references('countries.iso_3166_2').onDelete(
              'cascade',
            ),
        )
        .addUniqueConstraint('medication_country_registration_number', ['registration_number', 'country']),
  )

  // GIN trigram indexes for fast fuzzy search
  await sql`
    CREATE INDEX idx_medications_trade_name_gin ON medications
    USING GIN (trade_name gin_trgm_ops)
  `.execute(db)

  // Indexes on foreign key columns
  await db.schema.createIndex('idx_medication_doses_medication_id').on('medication_doses').column('medication_id').execute()
  await db.schema.createIndex('idx_medication_dose_ingredients_medication_dose_id').on('medication_dose_ingredients').column('medication_dose_id').execute()
  await db.schema.createIndex('idx_medication_availabilities_medication_id').on('medication_availabilities').column('medication_id').execute()
  await db.schema.createIndex('idx_medication_availabilities_country').on('medication_availabilities').column('country').execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropIndex('idx_medication_availabilities_country').execute()
  await db.schema.dropIndex('idx_medication_availabilities_medication_id').execute()
  await db.schema.dropIndex('idx_medication_dose_ingredients_medication_dose_id').execute()
  await db.schema.dropIndex('idx_medication_doses_medication_id').execute()
  await db.schema.dropIndex('idx_medications_trade_name_gin').execute()

  await db.schema.dropTable('medication_availabilities').execute()
  await db.schema.dropTable('medication_dose_ingredient_strength_equivalences').execute()
  await db.schema.dropTable('medication_dose_ingredient_strengths').execute()
  await db.schema.dropTable('medication_dose_ingredients').execute()
  await db.schema.dropTable('medication_doses').execute()
  await db.schema.dropTable('medications').execute()
}
