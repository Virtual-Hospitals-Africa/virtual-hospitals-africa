import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { stripAnsiCode } from 'std/fmt/colors.ts'
import assertHasProperty from '../../../../util/assertHasProperty.ts'
import assertLength from '../../../../util/assertLength.ts'
import compactMap from '../../../../util/compactMap.ts'
import { exists } from '../../../../util/exists.ts'
import { groupBy } from '../../../../util/groupBy.ts'
import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
import isString from '../../../../util/isString.ts'
import parseJSON from '../../../../util/parseJSON.ts'
import generateUUID from '../../../../util/uuid.ts'
import { positive_decimal } from '../../../../util/validators.ts'
import { forms_with_singular_doses, ParsedIngredient, ParsedMedication, unaffiliated_form_to_route } from './shared.ts'

type ZimbabweMedicationCsvRow = {
  trade_name: string
  generic_name: string
  forms: string
  strength: string
  category: string
  registration_no: string
  applicant_name: string
  manufacturers: string
}

function parseMedicationZimbabwe(
  medication: ZimbabweMedicationCsvRow,
): ParsedMedication {
  const drug_ingredients = medication.generic_name.split(';').map((ingredient) => ingredient.trim()).filter((ingredient) => ingredient !== 'PLACEBO')
  const strength_strings = medication.strength.split(';').map((strength) => strength.trim())
  assertEquals(strength_strings.length, drug_ingredients.length, `Drug has more strengths listed than ingredients`)

  const strengths_raw = strength_strings.map((str) =>
    getStrengthUnitAndValuesZimbabwe(
      str,
      medication.forms,
    )
  )

  const strength_units = compactMap(strengths_raw, ({ strength }) => strength.units)
  const ingredients: ParsedIngredient[] = strengths_raw.map(({ strength: { value, units } }, i) => {
    const name = drug_ingredients[i]
    if (units) return { name, strength: { value, units } }
    assertLength(strength_units, 1)
    return {
      name,
      strength: {
        value,
        units: strength_units[0],
      },
    }
  })

  const [form_raw, route] = medication.forms.split(';').map((s) => s.trim())
  const form = form_raw === 'PELLETS' ? 'PELLET' : form_raw
  // deno-lint-ignore no-explicit-any
  const routes = route ? [route] : (unaffiliated_form_to_route as any)[form]

  if (!routes) {
    throw new Error('No routes')
  }

  const dosage_value = exists(strengths_raw[0].dosage_value)
  const dosage_description = exists(strengths_raw[0].dosage_description)

  return {
    ...medication,
    form,
    routes,
    doses: [{
      value: dosage_value,
      units: dosage_description,
      form,
      ingredients,
    }],
    country: 'ZW',
  }
}

const positive_decimal_regex = /\d*(\.\d+)?/
const text_regex = /[a-zA-Z]+/g

function parseSingleStrength(part: string) {
  const [strength, dosage] = part.split('/').map((s) => s.trim())
  assert(strength, `strength is empty for ${part}`)

  const value_text = strength.match(positive_decimal_regex)?.[0]
  const value = String(positive_decimal.parse(value_text))

  // Assume percentages are by weight
  if (part.endsWith('%') || part.endsWith('PERCENT') || part.endsWith('W/W')) {
    return {
      value,
      units: 'G',
      dosage_value: '100',
      dosage_description: 'G',
    }
  }
  if (part.endsWith('W/V') || part.endsWith('M/V')) {
    return {
      value,
      units: 'G',
      dosage_value: '100',
      dosage_description: 'ML',
    }
  }
  if (part.endsWith('V/V')) {
    return {
      value,
      units: 'ML',
      dosage_value: '100',
      dosage_description: 'ML',
    }
  }

  const units = strength.match(text_regex)?.[0]

  if (!dosage) {
    return {
      value,
      units,
    }
  }
  const dosage_description = dosage.match(text_regex)?.[0]
  const dosage_value_text = dosage.match(positive_decimal_regex)?.[0] || '1'

  const dosage_value = String(positive_decimal.parse(dosage_value_text))

  return {
    value,
    units,
    dosage_description,
    dosage_value,
  }
}

function getStrengthUnitAndValuesZimbabwe(str: string, form: string) {
  assert(str)
  const strength = parseSingleStrength(str.replace('I.U.', 'IU').trim().toUpperCase())

  const dosage_description = strength.dosage_description || forms_with_singular_doses.find((f) => form.includes(f)) || 'DOSE'

  if (isString(strength.dosage_value) && strength.dosage_value.includes('/')) {
    throw new Error('dosage value includes /')
  }

  return {
    strength: {
      value: strength.value,
      units: strength.units,
    },
    dosage_value: String(strength.dosage_value || 1),
    dosage_description,
  }
}

export async function seedDataFromJSONZimbabwe() {
  const zimbabwe_medications: ZimbabweMedicationCsvRow[] = await parseJSON(
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

  // Generate UUIDs for empty registration numbers
  for (const row of zimbabwe_medications) {
    if (!row.registration_no) {
      row.registration_no = generateUUID()
    }
  }

  // deno-lint-ignore no-explicit-any
  const failed_zimbabwe: any[] = []
  const parsed = compactMap(zimbabwe_medications, (medication) => {
    try {
      const parsed_medication = parseMedicationZimbabwe(medication)
      assertHasProperty(parsed_medication, 'registration_no')
      return parsed_medication
    } catch (e) {
      failed_zimbabwe.push({
        medication,
        // deno-lint-ignore no-explicit-any
        reason: stripAnsiCode((e as any).message),
      })
    }
  })

  // Group by registration_no to merge medications with same registration but different doses
  const grouped: ParsedMedication[] = []
  for (const medications of groupBy(parsed, 'registration_no').values()) {
    const first = medications[0]
    if (medications.length > 1) {
      grouped.push({ ...first, doses: medications.flatMap((m) => m.doses) })
    } else {
      grouped.push(first)
    }
  }

  Deno.writeTextFileSync('./db/resources/12_inventory_medication_zimbabwe_failed_imports.json', humanReadableJson(failed_zimbabwe))
  return grouped
}
