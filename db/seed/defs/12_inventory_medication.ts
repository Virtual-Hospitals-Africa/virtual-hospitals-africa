import { z } from 'zod'
import { NonNullableProperty, TrxOrDb } from '../../../types.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { groupBy, groupByUniq } from '../../../util/groupBy.ts'
import uniq from '../../../util/uniq.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../../util/compact.ts'
import arraysEqual from '../../../util/arraysEqual.ts'
import sortBy from '../../../util/sortBy.ts'
import { define } from '../define.ts'
import * as inParallel from '../../../util/inParallel.ts'
import { positive_decimal, positive_integer } from '../../../util/validators.ts'
import { humanReadableJson, logReadableJson } from '../../../util/humanReadableJson.ts'
import { parseWithValues } from '../../../util/assertMatches.ts'
import { asResult } from '../../../util/asResult.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import compactMap from '../../../util/compactMap.ts'
import assertLength from '../../../util/assertLength.ts'
import { exists } from '../../../util/exists.ts'

export default define([
  'drug_ingredients',
  'medications',
  'consumables',
  'medication_ingredients',
  'medication_availabilities',
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
  PELLET: ['ORAL', 'RECTAL', 'VAGINAL'],
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

type ParsedMedication = {
  drug_ingredients: string[]
  strengths: NonNullableProperty<ParsedStrengths, 'strength_numerator_unit'>[]
  form: string
  routes: string[]
  strength_denominator: string
  strength_denominator_unit: string
  trade_name: string
  generic_name: string
  forms: string
  strength: string
  category: string
  registration_no: string
  applicant_name: string
  manufacturers: string
  country: string
}

type ParsedStrengths = {
  strength_numerator: string
  strength_numerator_unit?: string
  strength_denominator: string
  strength_denominator_unit: string
}

async function seedDataFromJSONZimbabwe(trx: TrxOrDb) {
  const zimbabwe_medications: ManufacturedMedicationCsvRow[] = await parseJSON(
    './db/resources/zimbabwe_list_of_medications.json',
  )

  const form_rewrite = {
    'GRANULES, FOR SUSPENSION; ORAL': 'GRANULE, FOR SUSPENSION; ORAL',
    'CAPSULES RECTAL': 'CAPSULE; RECTAL',
    'LOTIONS': 'LOTION; TOPICAL',
    'PELLETS': 'PELLET',
    'WAFERS': 'WAFER',
    'CREAMS': 'CREAM',
  }

  for (const row of zimbabwe_medications) {
    if (row.forms in form_rewrite) {
      // deno-lint-ignore no-explicit-any
      row.forms = (form_rewrite as any)[row.forms]
    }
  }

  // deno-lint-ignore no-explicit-any
  const failed_zimbabwe: any[] = []
  const parsed = compactMap(zimbabwe_medications, (medication) => {
    try {
      return parseMedicationZimbabwe(medication)
    } catch (e) {
      failed_zimbabwe.push({
        // deno-lint-ignore no-explicit-any
        medication,
        reason: (e as any).message,
      })
    }
  })
  logReadableJson({ failed_zimbabwe })

  const drug_ingredients = await trx.insertInto('drug_ingredients')
    .values(
      uniq(parsed.flatMap((m) => m.drug_ingredients)).map((name) => ({ name })),
    )
    .returningAll()
    .execute()

  const drug_ingredients_by_name = groupByUniq(drug_ingredients, 'name')

  for (const medication of parsed) {
    const { id: consumable_id } = await trx.insertInto('consumables')
      .values({ name: medication.trade_name, is_medication: true })
      .returning('id')
      .executeTakeFirstOrThrow()

    const { id: medication_id } = await trx.insertInto('medications')
      .values({
        trade_name: medication.trade_name,
        applicant_name: medication.applicant_name,
        manufacturer_name: medication.manufacturers,
        form: medication.form,
        routes: medication.routes,
        consumable_id,
        strength_denominator: medication.strengths[0].strength_denominator,
        strength_denominator_unit: medication.strengths[0].strength_denominator_unit,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    await trx.insertInto('medication_ingredients')
      .values(medication.drug_ingredients.map((name, i) => ({
        medication_id,
        drug_ingredient_id: drug_ingredients_by_name.get(name)!.id,
        strength_numerator: medication.strengths[i].strength_numerator,
        strength_numerator_unit: medication.strengths[i].strength_numerator_unit!,
      })))
      .execute()

    await trx.insertInto('medication_availabilities')
      .values({ medication_id, country: 'ZW' })
      .execute()
  }
}

const date = z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).transform(d => d.split('/').join('-'))
const za_schema = z.object({
  "secureId": z.string(),
  "applicantName":z.string(),
  "appSecureId":z.string(),
  "application_no":z.string(),
  "licence_no":z.string(),
  "productName":z.string(),
  "status":z.enum(["Registered", "Registrered", "Old Medicine", "Canceled"]).transform(status => status === "Registrered" ? "Registered" : status),
  "expiryDate":date,
  "reg_date":date,
  "ingredient":z.string(),
  "therapeutic_area":z.string().nullable(),
  "api":z.string()
})

async function seedDataFromJSONSouthAfrica(trx: TrxOrDb) {
  const contents = new TextDecoder().decode(Deno.readFileSync('./db/resources/sahpra.json'))
  const za_medications = parseWithValues(za_schema.array(), JSON.parse(contents))
  const registered_za_medications = za_medications.filter(({ status }) => status === "Registered")


}

function parseMedicationSouthAfrica() {

}

async function seedDataFromJSON(trx: TrxOrDb) {
  await seedDataFromJSONZimbabwe(trx)
  await seedDataFromJSONSouthAfrica(trx)
}

function parseMedicationZimbabwe(
  medication: ManufacturedMedicationCsvRow,
): ParsedMedication {
  const drug_ingredients = medication.generic_name.split(';').map((ingredient) => ingredient.trim()).filter((ingredient) => ingredient !== 'PLACEBO')
  const strength_strings = medication.strength.split(';').map((strength) => strength.trim())
  assertEquals(strength_strings.length, drug_ingredients.length, `Drug has more strengths listed than ingredients`)

  const strengths_raw = strength_strings.map((str) =>
    getStrengthUnitAndValues(
      str,
      medication.forms,
    )
  )

  const strength_numerator_units = compactMap(strengths_raw, (strength) => strength.strength_numerator_unit)
  const strengths = strengths_raw.map((raw): NonNullableProperty<ParsedStrengths, 'strength_numerator_unit'> => {
    if (raw.strength_numerator_unit) return raw
    assertLength(strength_numerator_units, 1)
    return {
      ...raw,
      strength_numerator_unit: strength_numerator_units[0],
    }
  })

  const [form_raw, route] = medication.forms.split(';').map((s) => s.trim())
  const form = form_raw === 'PELLETS' ? 'PELLET' : form_raw
  // deno-lint-ignore no-explicit-any
  const routes = route ? [route] : (unaffiliated_form_to_route as any)[form]

  if (!routes) {
    throw new Error('No routes')
  }

  return {
    ...medication,
    drug_ingredients,
    strengths,
    form,
    routes,
    strength_denominator: exists(strengths[0].strength_denominator),
    strength_denominator_unit: exists(strengths[0].strength_denominator_unit),
    country: 'ZW'
  }
}

const positive_decimal_regex = /\d*(\.\d+)?/
const text_regex = /[a-zA-Z]+/g

function parseSingleStrength(part: string) {
  const [numerator, denominator] = part.split('/').map((s) => s.trim())
  assert(numerator, `Numerator is empty for ${part}`)

  const numerator_value_text = numerator.match(positive_decimal_regex)?.[0]
  const numerator_value = String(positive_decimal.parse(numerator_value_text))

  // Assume percentages are by weight
  if (part.endsWith('%') || part.endsWith('PERCENT') || part.endsWith('W/W')) {
    return {
      numerator_value,
      numerator_unit: 'G',
      denominator_value: '100',
      denominator_unit: 'G',
    }
  }
  if (part.endsWith('W/V') || part.endsWith('M/V')) {
    return {
      numerator_value,
      numerator_unit: 'G',
      denominator_value: '100',
      denominator_unit: 'ML',
    }
  }
  if (part.endsWith('V/V')) {
    return {
      numerator_value,
      numerator_unit: 'ML',
      denominator_value: '100',
      denominator_unit: 'ML',
    }
  }

  const numerator_unit = numerator.match(text_regex)?.[0]

  if (!denominator) {
    return {
      numerator_value,
      numerator_unit,
    }
  }
  const denominator_unit = denominator.match(text_regex)?.[0]
  const denominator_value_text = denominator.match(positive_decimal_regex)?.[0] || '1'

  const denominator_value = String(positive_decimal.parse(denominator_value_text))

  return {
    numerator_value,
    numerator_unit,
    denominator_unit,
    denominator_value,
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
  'PELLET',
]

//TODO: if form is syrup take ml instead of mg
function getStrengthUnitAndValues(str: string, form: string): ParsedStrengths {
  assert(str)
  const value = parseSingleStrength(str.replace('I.U.', 'IU').trim().toUpperCase())

  const strength_denominator_unit = value.denominator_unit || forms_with_singular_doses.find((f) => form.includes(f)) || 'DOSE'

  return {
    strength_numerator: value.numerator_value,
    strength_numerator_unit: value.numerator_unit,
    strength_denominator: String(value.denominator_value || 1),
    strength_denominator_unit,
  }
}
