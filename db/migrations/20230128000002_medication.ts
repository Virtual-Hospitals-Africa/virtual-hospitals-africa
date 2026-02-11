import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'drug_ingredients',
    (qb) =>
      qb.addColumn(
        'name',
        'varchar(255)',
        (col) => col.notNull().unique(),
      ),
  )

  await createStandardTable(
    db,
    'medications',
    (qb) =>
      qb.addColumn('trade_name', 'varchar(1024)', (col) => col.notNull())
        .addColumn('applicant_name', 'varchar(1024)', (col) => col.notNull())
        .addColumn('manufacturer_name', 'varchar(2048)', (col) => col.notNull())
        .addColumn('form', 'varchar(255)', (col) => col.notNull())
        .addColumn('routes', sql`varchar(255)[]`, (col) => col.notNull())
        .addColumn('consumable_id', 'uuid', (col) => col.notNull().references('consumables.id').onDelete('cascade'))
        .addColumn('strength_denominator', 'decimal', (col) => col.notNull())
        .addColumn(
          'strength_denominator_unit',
          'varchar(255)',
          (col) => col.notNull(),
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

  await sql`
    ALTER TABLE medications
    ADD strength_denominator_is_units BOOLEAN NOT NULL
    GENERATED ALWAYS AS (
      strength_denominator_unit IN ('MG', 'G', 'ML', 'L', 'MCG', 'UG', 'IU')
    )
    STORED
  `.execute(db)

  await createStandardTable(
    db,
    'medication_ingredients',
    (qb) =>
      qb.addColumn('medication_id', 'uuid', (col) =>
        col.notNull().references('medications.id').onDelete(
          'cascade',
        ))
        .addColumn('drug_ingredient_id', 'uuid', (col) =>
          col.notNull().references('drug_ingredients.id').onDelete(
            'cascade',
          ))
        .addColumn(
          'strength_numerator',
          'decimal',
          (col) => col.notNull(),
        )
        .addColumn(
          'strength_numerator_unit',
          'varchar(255)',
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
          'country',
          'varchar(2)',
          (col) =>
            col.notNull().references('countries.iso_3166_2').onDelete(
              'cascade',
            ),
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('medication_availabilities').execute()
  await db.schema.dropTable('medication_ingredients').execute()
  await db.schema.dropTable('medications').execute()
  await db.schema.dropTable('drug_ingredients').execute()
}
