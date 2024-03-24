//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import groupBy from '../../util/groupBy.ts'
import uniq from '../../util/uniq.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../util/compact.ts'
import arraysEqual from '../../util/arraysEqual.ts'
import sortBy from '../../util/sortBy.ts'
import { createSeedMigration } from '../seedMigration.ts'
import * as inParallel from '../../util/inParallel.ts'

export default createSeedMigration([
  'drugs',
  'medications',
  'consumables',
  'manufactured_medications',
  'manufactured_medication_strengths',
], seedDataFromJSON)

const unaffiliated_form_to_route = {
  BALSAM: ['ORAL', 'TOPICAL'],
  CAPSULE: ['ORAL', 'RECTAL', 'VAGINAL'],
  CREAM: ['TOPICAL', 'VAGINAL', 'RECTAL'],
  GEL: ['ORAL', 'TOPICAL'],
  INJECTABLE: ['INJECTION'],
  INHALATION: ['INHALATION'],
  LIQUID: ['INHALATION', 'INJECTION', 'ORAL', 'TOPICAL'],
  LOTION: ['TOPICAL'],
  PELLETS: ['ORAL', 'RECTAL', 'VAGINAL'],
  SOLUTION: ['INJECTION', 'ORAL', 'INHALATION', 'TOPICAL'],
  SUSPENSION: ['ORAL', 'INJECTION'],
  TABLET: ['ORAL', 'RECTAL', 'VAGINAL', 'SUBLINGUAL', 'BUCCAL'],
  'TABLET, COATED': ['ORAL', 'RECTAL', 'VAGINAL', 'SUBLINGUAL', 'BUCCAL'],
  VACCINE: ['ORAL', 'INJECTION'],
  WAFER: ['TOPICAL'],
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

const form_rewrite = {
  'GRANULES, FOR SUSPENSION; ORAL': 'GRANULE, FOR SUSPENSION; ORAL',
  'CAPSULES RECTAL': 'CAPSULE; RECTAL',
  'LOTIONS': 'LOTION; TOPICAL',
  'PELLETS': 'PELLET',
  'WAFERS': 'WAFER',
  'CREAMS': 'CREAM',
}

async function seedDataFromJSON(db: Kysely<any>) {
  await db
    .insertInto('consumables')
    .values({ name: 'bandage' })
    .executeTakeFirst()

  const data: ManufacturedMedicationCsvRow[] = await parseJSON(
    './db/resources/list_of_medications.json',
  )

  for (const row of data) {
    if (row.forms in form_rewrite) {
      row.forms = (form_rewrite as any)[row.forms]
    }
  }

  const drugs = groupBy(data, (d) => d.generic_name)

  // Log all unique forms
  // console.log(uniq(data.map(d => d.forms)).sort())
  await inParallel.forEach([...drugs.entries()], addDrug.bind(null, db))

  if (skippedDrugs.length) {
    Deno.writeTextFileSync(
      './db/resources/skipped_drugs.json',
      JSON.stringify(skippedDrugs, null, 2),
    )
  }
}

async function addDrug(
  db: Kysely<any>,
  [generic_name, manufactured_medications]: [
    string,
    ManufacturedMedicationCsvRow[],
  ],
) {
  const forms = groupBy(manufactured_medications, (m) => m.forms)

  const medications = compact(
    [...forms.entries()].map(([form, manufactured_medications]) => {
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
    return
  }

  const { id: drug_id } = await db
    .insertInto('drugs')
    .values({ generic_name })
    .returning('id')
    .executeTakeFirstOrThrow()

  for (const medication of medications) {
    const [form, route] = medication.form.split(';').map((s) => s.trim())
    const routes = route ? [route] : (unaffiliated_form_to_route as any)[form]
    if (!routes) {
      console.error(generic_name)
      console.error(medication)
      throw new Error(`No route found for ${form}`)
    }

    const { id: medication_id } = await db
      .insertInto('medications')
      .values({
        drug_id,
        form,
        routes,
        ...medication.strengths,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    for (
      const { manufactured_medication, strengths } of medication
        .manufactured_medications_with_strengths
    ) {
      const manufacturer_name = manufactured_medication.manufacturers.replace(
        /;$/,
        '',
      )
      const { applicant_name, trade_name } = manufactured_medication

      const mm = await db
        .insertInto('manufactured_medications')
        .values({
          medication_id,
          manufacturer_name,
          trade_name,
          applicant_name,
          strength_numerators: strengths.strength_numerators,
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      for (const strength_numerator of strengths.strength_numerators) {
        const consumable = await db
          .insertInto('consumables')
          .values({
            name:
              `${trade_name} ${strength_numerator}${medication.strengths.strength_numerator_unit} ${form} by ${applicant_name}`,
          })
          .returning('id')
          .executeTakeFirstOrThrow()

        await db
          .insertInto('manufactured_medication_strengths')
          .values({
            manufactured_medication_id: mm.id,
            consumable_id: consumable.id,
            strength_numerator,
          })
          .executeTakeFirstOrThrow()
      }
    }
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
  'INHALATION',
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
