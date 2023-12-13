//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import groupBy from '../../util/groupBy.ts'
import uniq from '../../util/uniq.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../util/compact.ts'
import arraysEqual from '../../util/arraysEqual.ts'
import sortBy from '../../util/sortBy.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('drugs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('generic_name', 'varchar(255)', (col) => col.notNull())
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
    .addUniqueConstraint('drugs_generic_name_unique', ['generic_name'])
    .execute()

  await db.schema
    .createTable('medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'drug_id',
      'integer',
      (col) => col.notNull().references('drugs.id').onDelete('cascade'),
    )
    .addColumn('form', 'varchar(255)', (col) => col.notNull())
    .addColumn(
      'strength_numerators',
      sql`numeric(10, 2)[]`,
      (col) => col.notNull(),
    )
    .addColumn(
      'strength_numerator_unit',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn('strength_denominator', 'numeric(10, 2)', (col) => col.notNull())
    .addColumn(
      'strength_denominator_unit',
      'varchar(255)',
      (col) => col.notNull(),
    )
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
    .addCheckConstraint(
      'at_least_one_strength_check',
      sql`array_length(strength_numerators, 1) >= 1`,
    )
    .execute()

  await db.schema
    .createTable('manufactured_medication')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('trade_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('applicant_name', 'varchar(1024)', (col) => col.notNull())
    .addColumn('manufacturer_name', 'varchar(2048)', (col) => col.notNull())
    .addColumn(
      'strength_numerators',
      sql`numeric(10, 2)[]`,
      (col) => col.notNull(),
    )
    .addColumn(
      'medication_id',
      'integer',
      (col) => col.notNull().references('medications.id').onDelete('cascade'),
    )
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
    .createTable('patient_condition_medications')
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
      'patient_condition_id',
      'integer',
      (col) =>
        col.notNull().references('patient_conditions.id').onDelete('cascade'),
    )
    .addColumn(
      'medication_id',
      'integer',
      (col) => col.references('medications.id').onDelete('cascade'),
    )
    .addColumn(
      'manufactured_medication_id',
      'integer',
      (col) => col.references('manufactured_medication.id').onDelete('cascade'),
    )
    .addColumn('dosage', 'numeric(10, 2)')
    .addColumn('intake_frequency', 'varchar(255)')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date')
    .addCheckConstraint(
      'patient_condition_medications_med_id_check',
      sql`(manufactured_medication_id IS NOT NULL AND medication_id IS NULL) OR (medication_id IS NOT NULL AND manufactured_medication_id IS NULL)`,
    )
    .addCheckConstraint(
      'end_date_after_start_date_if_present_check',
      sql`end_date IS NULL OR end_date >= start_date`,
    )
    .execute()

  await addUpdatedAtTrigger(db, 'drugs')
  await addUpdatedAtTrigger(db, 'medications')
  await addUpdatedAtTrigger(db, 'manufactured_medication')
  await addUpdatedAtTrigger(db, 'patient_condition_medications')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropTable('manufactured_medication').execute()
  await db.schema.dropTable('medications').execute()
  await db.schema.dropTable('drugs').execute()
}

type ManufacturedMedicationCsvRow = {
  trade_name: string
  generic_name: string
  forms: string
  strength: string
  category: string
  registration_no: string
  applicant_name: string
  manufacturers: string
}

type ParsedStrengths = {
  strength_numerators: number[]
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
}

const skippedDrugs: { drug: any; reason: string }[] = []

async function seedDataFromJSON(db: Kysely<any>) {
  const data: ManufacturedMedicationCsvRow[] = await parseJSON(
    './db/resources/list_of_medications.json',
  )

  const drugs = groupBy(data, (d) => d.generic_name)

  // Log all unique forms
  // console.log(uniq(data.map(d => d.forms)).sort())

  for (
    const [generic_name, manufactured_medications] of Object.entries(drugs)
  ) {
    const forms = groupBy(manufactured_medications, (m) => m.forms)

    const medications = compact(
      Object.entries(forms).map(([form, manufactured_medications]) => {
        const manufactured_medications_with_strengths = compact(
          manufactured_medications.map((manufactured_medication) => {
            try {
              return {
                strengths: getStrengthUnitAndValues(
                  manufactured_medication.strength,
                  form,
                ),
                manufactured_medication,
              }
            } catch (e) {
              skippedDrugs.push({
                drug: manufactured_medication,
                reason: e.message,
              })
            }
          }),
        )

        if (!manufactured_medications_with_strengths.length) {
          return
        }

        const first_strength =
          manufactured_medications_with_strengths[0].strengths

        const same_units = manufactured_medications_with_strengths.every((
          { strengths },
        ) => (
          first_strength.strength_numerator_unit ===
            strengths.strength_numerator_unit &&
          first_strength.strength_denominator ===
            strengths.strength_denominator &&
          first_strength.strength_denominator_unit ===
            strengths.strength_denominator_unit
        ))

        if (!same_units) {
          skippedDrugs.push({
            drug: manufactured_medications_with_strengths,
            reason: 'Units are not the same',
          })
          return
        }

        const strengths = {
          strength_numerators: sortBy(
            uniq(
              manufactured_medications_with_strengths.flatMap(({ strengths }) =>
                strengths.strength_numerators
              ),
            ),
          ),
          strength_numerator_unit: first_strength.strength_numerator_unit,
          strength_denominator: first_strength.strength_denominator,
          strength_denominator_unit: first_strength.strength_denominator_unit,
        }

        return {
          form,
          strengths,
          manufactured_medications_with_strengths,
        }
      }),
    )

    if (!medications.length) {
      continue
    }

    const { id: drug_id } = await db
      .insertInto('drugs')
      .values({ generic_name })
      .returning('id')
      .executeTakeFirstOrThrow()

    for (const medication of medications) {
      const { id: medication_id } = await db
        .insertInto('medications')
        .values({
          drug_id,
          form: medication.form,
          ...medication.strengths,
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      for (
        const { manufactured_medication, strengths } of medication
          .manufactured_medications_with_strengths
      ) {
        await db
          .insertInto('manufactured_medication')
          .values({
            strength_numerators: strengths.strength_numerators,
            trade_name: manufactured_medication.trade_name,
            applicant_name: manufactured_medication.applicant_name,
            manufacturer_name: manufactured_medication.manufacturers,
            medication_id: medication_id,
          })
          .executeTakeFirstOrThrow()
      }
    }
  }

  if (skippedDrugs.length) {
    console.log(`Skipped drugs`)
    console.log(JSON.stringify(skippedDrugs, null, 2))
  }
}

const textRegex = /[a-zA-Z]+/g

function parseSingleStrength(part: string) {
  const [numerator, denominator] = part.split('/').map((s) => s.trim())
  assert(numerator, `Numerator is empty for ${part}`)

  const numerator_value = parseFloat(numerator)

  // Assume percentages are by weight
  if (part.endsWith('%') || part.endsWith('PERCENT') || part.endsWith('W/W')) {
    return {
      numerator_value,
      numerator_unit: 'G',
      denominator_value: 100,
      denominator_unit: 'G',
    }
  }
  if (part.endsWith('W/V') || part.endsWith('M/V')) {
    return {
      numerator_value,
      numerator_unit: 'G',
      denominator_value: 100,
      denominator_unit: 'ML',
    }
  }
  if (part.endsWith('V/V')) {
    return {
      numerator_value,
      numerator_unit: 'ML',
      denominator_value: 100,
      denominator_unit: 'ML',
    }
  }

  const numerator_unit = numerator.match(textRegex)?.[0]
  const denominator_unit = denominator && denominator.match(textRegex)?.[0]

  const denominator_value = denominator && parseFloat(denominator)
  return {
    numerator_value,
    numerator_unit,
    denominator_value,
    denominator_unit,
  }
}

// These are forms with a clear singular dosage.
// Other forms, like ointments or syrups
const forms_with_singular_doses = [
  'TABLET',
  'INJECTION',
  'IMPLANT',
  'SUPPOSITORY',
  'INFUSION',
  'CAPSULE',
  'VACCINE',
  'LOZENGE',
]

//TODO: if form is syrup take ml instead of mg
function getStrengthUnitAndValues(str: string, form: string): ParsedStrengths {
  assert(str)
  const values = compact(
    str.replace('I.U.', 'IU').split(';').map((part) =>
      part.trim().toUpperCase()
    ),
  ).reverse().map(parseSingleStrength)
  const numerator_units = sortBy(
    compact(uniq(values.map((v) => v.numerator_unit))),
  )
  const denominator_units = sortBy(
    compact(uniq(values.map((v) => v.denominator_unit))),
  )
  const denominator_values = sortBy(
    compact(uniq(values.map((v) => v.denominator_value))),
  )

  assert(
    numerator_units.length === 1 ||
      arraysEqual(numerator_units, ['G', 'MG']) ||
      arraysEqual(numerator_units, ['MCG', 'MG']) ||
      arraysEqual(numerator_units, ['M', 'MCG']),
    `Multiple numerator units found for ${str} ${form}: ${
      numerator_units.join(', ')
    }`,
  )

  const single_dose_form = forms_with_singular_doses.find((f) =>
    form.includes(f)
  )
  assert(
    denominator_units.length <= 1,
    `Multiple denominator units found for ${str} ${form}`,
  )
  assert(
    denominator_values.length <= 1,
    `Multiple denominator values found for ${str} ${form}`,
  )

  const strength_denominator_unit = denominator_units[0] || single_dose_form
  assert(
    strength_denominator_unit,
    `No denominator unit found for ${str} ${form}`,
  )

  if (numerator_units.length === 1) {
    return {
      strength_numerators: sortBy(values.map((v) => v.numerator_value)),
      strength_numerator_unit: numerator_units[0],
      strength_denominator: denominator_values[0] || 1,
      strength_denominator_unit,
    }
  }

  if (arraysEqual(numerator_units, ['G', 'MG'])) {
    return {
      strength_numerators: sortBy(
        values.map((v) =>
          v.numerator_unit === 'G'
            ? 1000 * v.numerator_value
            : v.numerator_value
        ),
      ),
      strength_numerator_unit: 'MG',
      strength_denominator: denominator_values[0] || 1,
      strength_denominator_unit,
    }
  }

  if (arraysEqual(numerator_units, ['MCG', 'MG'])) {
    return {
      strength_numerators: sortBy(
        values.map((v) =>
          v.numerator_unit === 'MG'
            ? 1000 * v.numerator_value
            : v.numerator_value
        ),
      ),
      strength_numerator_unit: 'MCG',
      strength_denominator: denominator_values[0] || 1,
      strength_denominator_unit,
    }
  }

  // Assume MCG and M are the same
  if (arraysEqual(numerator_units, ['M', 'MCG'])) {
    return {
      strength_numerators: sortBy(values.map((v) => v.numerator_value)),
      strength_numerator_unit: 'MCG',
      strength_denominator: denominator_values[0] || 1,
      strength_denominator_unit,
    }
  }

  throw new Error(`Not sure what's going on with ${str} ${form}`)
}

/* Unique Forms
  AEROSOL; INHALATION
  BALSAM
  CAPSULE
  CAPSULE; ORAL
  CAPSULES RECTAL
  CREAM; TOPICAL
  CREAMS
  ELIXIR; ORAL
  EMULSION; TOPICAL
  EMULSIONS; INJECTABLE
  GAS; INHALATION
  GEL
  GRANULE, EFFERVESCENT; ORAL
  GRANULE, FOR SUSPENSION; ORAL
  GRANULES, FOR SUSPENSION; ORAL
  IMPLANT; SUBCUTANEOUS
  INHALATION
  INJECTABLE; INJECTION
  INJECTABLE; INJECTION, AMPOULE
  INJECTABLE; IV (INFUSION)
  LINCTUS; ORAL
  LINIMENT; TOPICAL
  LIQUID
  LIQUID; ORAL
  LOTION; TOPICAL
  LOTIONS
  MIXTURE; ORAL
  OINTMENT; OPHTHALMIC
  OINTMENT; TOPICAL
  PAINT; TOPICAL
  PELLETS
  PESSARY; VAGINAL
  POWDER, FOR SUSPENSION; ORAL
  POWDER, SOLUBLE; ORAL
  POWDER/INJECTABLE; INJECTION
  POWDER/SATCHETS; ORAL
  POWDER; ORAL
  SHAMPOO; TOPICAL
  SOLUTION
  SOLUTION, GARGEL; ORAL
  SOLUTION/DROPS; NASAL
  SOLUTION/DROPS; OPHTHALMIC
  SOLUTION/DROPS; ORAL
  SOLUTION/DROPS; OTIC
  SOLUTION/MOUTHWASH; ORAL
  SOLUTION; INFUSION
  SOLUTION; INJECTION
  SOLUTION; INTRAPERIOTONEAL
  SOLUTION; IRRIGATION
  SPRAY, METERED; NASAL
  SUPPOSITORY; RECTAL
  SUSPENSION
  SUSPENSION/DROPS; OPHTHALMIC
  SUSPENSION; ORAL
  SYRUP; ORAL
  TABLET
  TABLET, COATED; ORAL
  TABLET, EFFERVESCENT; ORAL
  TABLET; ORAL
  TROCHE/LOZENGE; ORAL
  VACCINE
  WAFERS
  WATERS, AROMATIC; ORAL
*/
