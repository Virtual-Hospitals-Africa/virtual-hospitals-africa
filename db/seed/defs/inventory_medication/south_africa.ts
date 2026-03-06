import { assert } from 'std/assert/assert.ts'
import z from 'zod'
import { assertArrayNonEmpty } from '../../../../util/arraySize.ts'
import entries from '../../../../util/entries.ts'
import { positive_decimal } from '../../../../util/validators.ts'
import { CLAUDE_GENERATED_PROBABLE_SOUTH_AFRICAN_PRODUCT_FORM_ROUTES } from '../../../resources/claude_generated_probable_product_form_routes_south_africa.ts'
import { stripAnsiCode } from 'std/fmt/colors.ts'
import { parseWithValues } from '../../../../util/assertMatches.ts'
import compactMap from '../../../../util/compactMap.ts'
import { groupBy } from '../../../../util/groupBy.ts'
import { humanReadableJson } from '../../../../util/humanReadableJson.ts'
import parseJSON from '../../../../util/parseJSON.ts'
import sortBy from '../../../../util/sortBy.ts'
import { forms_with_singular_doses, ParsedDose, ParsedMedication, unaffiliated_form_to_route } from './shared.ts'
import { omitUndefinedProperties } from '../../../../util/omitUndefinedProperties.ts'

const date = z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).transform((d) => d.split('/').join('-'))
const za_schema = z.object({
  'secureId': z.string(),
  'applicantName': z.string(),
  'appSecureId': z.string(),
  'application_no': z.string(),
  'licence_no': z.string(),
  'productName': z.string(),
  'status': z.enum(['Registered', 'Registrered', 'Old Medicine', 'Canceled']).transform((status) => status === 'Registrered' ? 'Registered' : status),
  'expiryDate': date,
  'reg_date': date,
  'ingredient': z.string(),
  'therapeutic_area': z.string().nullable(),
  'api': z.string(),
})

export type SouthAfricaMedicationRow = z.infer<typeof za_schema>

// Misspelling corrections: maps typos to canonical forms in unaffiliated_form_to_route
const south_africa_form_rewrite: Record<string, string> = {
  'ATBLET': 'TABLET',
  'TABET': 'TABLET',
  'TABLE': 'TABLET',
  'TABLER': 'TABLET',
  'TALBET': 'TABLET',
  'TABELT': 'TABLET',
  'TABLTE': 'TABLET',
  'TABLAET': 'TABLET',
  'TABLETT': 'TABLET',
  'SUPENSION': 'SUSPENSION',
  'SUPSENSION': 'SUSPENSION',
  'SUSPENION': 'SUSPENSION',
  'AMOULE': 'AMPOULE',
  'SULUTION': 'SOLUTION',
  'SOLUTTION': 'SOLUTION',
  'SOLOTION': 'SOLUTION',
  'LIQIUD': 'LIQUID',
  'PREIFILLED SYRINGE': 'PRE-FILLED SYRINGE',
  'PASSARY': 'PESSARY',
  'OPTHALMIC SUSPENSION': 'OPHTHALMIC SUSPENSION',
  'CENTERIC COATED TABLET': 'ENTERIC COATED TABLET',
  'RECONSTITUDED ENEMA': 'ENEMA',
  'TABLETS': 'TABLET',
  'SOLUTIONS': 'SOLUTION',
  'CAPSULES': 'CAPSULE',
}

type FormRoutes = { form: string; routes: string[] }

// Try to infer form and routes from the product name
function inferFormRoutesFromProductName(productName: string): FormRoutes | null {
  const upper = productName.toUpperCase()

  // "X FOR Y" patterns like "SUSPENSION FOR INJECTION"
  const for_match = upper.match(/\b(SUSPENSION|SOLUTION|POWDER|CONCENTRATE)\s+FOR\s+(INJECTION|INFUSION|INHALATION|ORAL USE)\b/)
  if (for_match) {
    const route = for_match[2] === 'INFUSION' ? 'INJECTION' : for_match[2] === 'ORAL USE' ? 'ORAL' : for_match[2]
    return { form: for_match[1], routes: [route] }
  }

  // Specific route keywords first (most specific)
  if (upper.includes('VACCINE')) return { form: 'VACCINE', routes: ['INJECTION'] }
  if (
    upper.includes('INHALER') || upper.includes('TURBUHALER') || upper.includes('ACCUHALER') ||
    upper.includes('ELIPTA') || upper.includes('BREEZHALER') || upper.includes('CLICKHALER') ||
    upper.includes('AUTOHALER') || upper.includes('TWISTHALER') || upper.includes('ECOHALER') ||
    upper.match(/\bDPI\b/) || upper.match(/\bCFC[\s-]FREE\b/)
  ) {
    return { form: 'INHALATION', routes: ['INHALATION'] }
  }
  if (upper.includes('NASAL') || upper.includes('NASULE')) {
    return { form: 'SPRAY', routes: ['NASAL'] }
  }
  if (upper.includes('EYE DROP') || upper.includes('EAR DROP')) {
    return { form: 'DROPS', routes: ['OPHTHALMIC'] }
  }
  if (upper.includes('INJECTION') || upper.includes('INJECTABLE')) {
    return { form: 'INJECTABLE', routes: ['INJECTION'] }
  }
  if (upper.includes('TABLET')) return { form: 'TABLET', routes: ['ORAL'] }
  if (upper.includes('CAPSULE')) return { form: 'CAPSULE', routes: ['ORAL'] }
  if (upper.includes('CREAM')) return { form: 'CREAM', routes: ['TOPICAL'] }
  if (upper.includes('OINTMENT')) return { form: 'OINTMENT', routes: ['TOPICAL'] }
  if (upper.includes('SYRUP')) return { form: 'SYRUP', routes: ['ORAL'] }
  if (upper.includes('SUSPENSION')) return { form: 'SUSPENSION', routes: ['ORAL'] }
  if (upper.includes('ENEMA')) return { form: 'SOLUTION', routes: ['RECTAL'] }
  if (upper.includes('SPRAY')) return { form: 'SPRAY', routes: ['NASAL', 'ORAL', 'TOPICAL'] }
  if (upper.includes('SUPPOSITORY')) return { form: 'SUPPOSITORY', routes: ['RECTAL', 'VAGINAL'] }
  if (upper.includes('VAGINAL')) return { form: 'SUPPOSITORY', routes: ['VAGINAL'] }
  if (upper.includes('PATCH')) return { form: 'PATCH', routes: ['TOPICAL'] }
  if (upper.includes('GEL')) return { form: 'GEL', routes: ['TOPICAL'] }
  if (upper.includes('LOTION')) return { form: 'LOTION', routes: ['TOPICAL'] }
  if (upper.includes('SHAMPOO')) return { form: 'SHAMPOO', routes: ['TOPICAL'] }
  if (upper.includes('SOLUTION')) return { form: 'SOLUTION', routes: ['INJECTION', 'ORAL'] }
  if (upper.includes('DROPS')) return { form: 'DROPS', routes: ['TOPICAL', 'ORAL'] }
  if (upper.includes('ORAL')) return { form: 'LIQUID', routes: ['ORAL'] }

  return null
}

export async function seedDataFromJSONSouthAfrica() {
  const za_medications = parseWithValues(za_schema.array(), await parseJSON('./db/resources/sahpra.json'))
  const registered_za_medications_with_ingredients = za_medications
    .filter(({ status }) => status === 'Registered')
    .filter(({ ingredient }) => ingredient !== 'None')

  // deno-lint-ignore no-explicit-any
  const failed_south_africa: any[] = []
  const parsed = compactMap(uniqueByLicenceNumberWithLongerIngredient(), (medication) => {
    try {
      return parseMedicationSouthAfrica(medication)
    } catch (e) {
      failed_south_africa.push({
        medication,
        // deno-lint-ignore no-explicit-any
        reason: stripAnsiCode((e as any).message),
      })
    }
  })
  Deno.writeTextFileSync('./db/resources/12_inventory_medication_south_africa_failed_imports.json', humanReadableJson(failed_south_africa))
  return parsed

  function* uniqueByLicenceNumberWithLongerIngredient() {
    for (const medications of groupBy(registered_za_medications_with_ingredients, 'licence_no').values()) {
      yield sortBy(medications, (medication) => -medication.ingredient.length)[0]
    }
  }
}

export function parseMedicationSouthAfrica(
  medication: z.infer<typeof za_schema>,
): ParsedMedication {
  const { text: ingredient_raw, equivalent_to_map } = initialSouthAfricaIngredientMassage(medication.ingredient)

  // Rewrite blister pack format: "EACH BLISTER PACK CONTAINS TWO FORM, EACH CONTAINING X AND ONE FORM CONTAINING Y"
  // → "EACH FORM CONTAINS X\nEACH FORM CONTAINS Y"
  const blister_pack_match = ingredient_raw.match(
    /^EACH BLISTER PACK CONTAINS (?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN) ([A-Z]+),? EACH CONTAINING (.+?) AND (?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN) ([A-Z]+) CONTAINING (.+)$/i,
  )
  const ingredient = blister_pack_match
    ? `EACH ${blister_pack_match[1].replace(/S$/i, '')} CONTAINS ${blister_pack_match[2]}\nEACH ${blister_pack_match[3].replace(/S$/i, '')} CONTAINS ${
      blister_pack_match[4]
    }`
    : ingredient_raw

  // Split into multiple dose sections on "EACH" boundaries
  // e.g. "EACH BROWN TABLET CONTAINS: ... EACH WHITE TABLET CONTAINS: ..."
  const dose_sections = ingredient
    .split(/(?=EACH\s)/)
    .map((s: string) => s.replace(/^[,;\s]+/, '').trim())
    .filter(Boolean)
    .map(matchHeader)

  if (dose_sections.length === 0) {
    throw new Error(`No dose sections found: "${ingredient}"`)
  }

  // console.log({dose_sections})
  // // Determine form/routes from the first section's header or product name
  // const first_header_match = dose_sections[0].match(header_regex)
  // if (!first_header_match) {
  //   throw new Error(`Could not parse ingredient header: "${dose_sections[0]}"`)
  // }
  // const [, , dosage_description_raw, form_raw] = first_header_match

  function getRoutes(form: string): FormRoutes {
    const routes = unaffiliated_form_to_route[form]
    assert(routes, `No routes for form: "${form}"`)
    return { form, routes }
  }

  function getFormRoutes(): FormRoutes {
    const inferred = inferFormRoutesFromProductName(medication.productName)
    if (inferred) return inferred
    if (dose_sections[0].form_raw) {
      const form = dose_sections[0].form_raw.trim()
      return getRoutes(form)
    }
    const lookup = CLAUDE_GENERATED_PROBABLE_SOUTH_AFRICAN_PRODUCT_FORM_ROUTES[medication.productName]
    if (lookup) return { form: lookup[0], routes: lookup[1] }
    if (dose_sections[0].dosage_units === 'ML') {
      return getRoutes('LIQUID')
    }
    throw new Error('Could not determine form')
  }
  const { form, routes } = getFormRoutes()

  const doses = dose_sections.map((section) => parseSouthAfricaDoseSection(section, form))

  // Populate equivalent_to from the extraction map (covers cases where the massage stripped EQUIVALENT TO)
  for (const dose of doses) {
    for (const ing of dose.ingredients) {
      if (!ing.equivalent_to) {
        const equivalent_to = equivalent_to_map.get(ing.name) ?? null
        if (equivalent_to) {
          ing.equivalent_to = equivalent_to
        }
      }
    }
  }

  return {
    form,
    routes,
    doses,
    country: 'ZA',
    trade_name: medication.productName,
    registration_no: medication.licence_no,
    applicant_name: medication.applicantName,
    manufacturers: medication.applicantName,
  }
}

type ParsedSouthAfricaIngredient = {
  name: string
  equivalent_to?: string | { name: string; strength: { value: string; units: string } }
  strength: null | { value: string; units: string }
  dosage_value?: string
  dosage_description?: string
}

function parseSouthAfricaPercentIngredient(part: string): ParsedSouthAfricaIngredient | null {
  const percent_regex = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:%|PERCENT)\s*(W\/W|W\/V|M\/V|M\/M|V\/V)?\s*$/
  const match = part.match(percent_regex)
  if (!match) return null
  const [, name, value, qualifier] = match
  // Same logic as Zimbabwe's parseSingleStrength for percentage strengths
  if (qualifier === 'V/V') {
    return { name: name.trim(), strength: { value, units: 'ML' }, dosage_value: '100', dosage_description: 'ML' }
  }
  if (qualifier === 'W/V' || qualifier === 'M/V') {
    return { name: name.trim(), strength: { value, units: 'G' }, dosage_value: '100', dosage_description: 'ML' }
  }
  // Default (no qualifier, W/W, or bare %): assume by weight
  return { name: name.trim(), strength: { value, units: 'G' }, dosage_value: '100', dosage_description: 'G' }
}

const unit_pattern = '(?:MILLION\\s+IU|MEGAUNITS|UG\\/ML|IU\\/ML|MG\\/ML|UG\\/CM|UNITS|MCG|MBQ|CCID|MIU|MG|ML|UG|IU|KU|MU|FFU|NG|U|G)'
const value_pattern = '(\\d+(?:.\\d+)*)'

export function parseSouthAfricaIngredient(ingredient_string: string): ParsedSouthAfricaIngredient[] {
  ingredient_string = ingredient_string.trim()

  // Skip obvious garbage
  if (!ingredient_string || ingredient_string === 'NONE') return []
  if (/^\d+$/.test(ingredient_string)) throw new Error(`Just number ${ingredient_string}`)
  if (ingredient_string.length <= 2 && !/\d/.test(ingredient_string)) return []
  if (/^(TWO|ONE|THREE|FOUR|PER)\s/i.test(ingredient_string)) throw new Error(`descriptive text ${ingredient_string}`)
  if (ingredient_string === 'AXA' || ingredient_string === 'ING' || ingredient_string === 'VI') throw new Error(`known garbage ${ingredient_string}`)
  if (/\d+\.?\d*-\d+\.?\d*/.test(ingredient_string)) throw new Error(`Range detected ${ingredient_string}`)

  // Split into multiple ingredients if string contains several: "NAME1 10,0 MG NAME2 320,0 MG" → ["NAME1 10,0 MG", "NAME2 320,0 MG"]
  const split_regex = new RegExp(`(\\d+(?:[.,]\\d+)?\\s*${unit_pattern})\\s+(?=[A-Z])`, 'g')
  const parts = ingredient_string.replace(split_regex, '$1\n').split('\n').map((s) => s.trim()).filter(Boolean)
  if (parts.length > 1) {
    return parts.flatMap(parseSouthAfricaIngredient)
  }

  const ingredient_regex = new RegExp(`^(.+?)\\s+${value_pattern}\\s*${unit_pattern}\\s*$`)

  // Handle EQUIVALENT TO — always use the salt form name (before EQUIVALENT TO)
  const eq_idx = ingredient_string.indexOf('EQUIVALENT TO')
  if (eq_idx !== -1) {
    const before_eq = ingredient_string.slice(0, eq_idx).trim().replace(/,\s*$/, '')
    const after_eq = ingredient_string.slice(eq_idx + 'EQUIVALENT TO'.length).trim()
    // Try: <value> <unit> <DRUG_NAME> (e.g. "500,0 MG ERYTHROMYCIN")
    const match1 = after_eq.match(new RegExp(`^${value_pattern}\\s*${unit_pattern}\\s+(.+)$`))
    if (match1) return [{ name: before_eq, equivalent_to: match1[2], strength: { value: match1[1], units: after_eq.match(new RegExp(unit_pattern))![0] } }]

    // Try: <DRUG_NAME> <value> <unit> (e.g. "APOMORPHINE 2,0 MG")
    const match2 = after_eq.match(ingredient_regex)
    if (match2) {
      return [{
        name: before_eq,
        equivalent_to: match2[1],
        strength: { value: match2[2], units: after_eq.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim() },
      }]
    }

    // Try: just <value> <unit> (no drug name, use name from before EQUIVALENT TO)
    const match3 = after_eq.match(new RegExp(`^${value_pattern}\\s*${unit_pattern}\\s*$`))
    if (match3) {
      const units = after_eq.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim()
      return [{ name: before_eq, strength: { value: match3[1], units } }]
    }

    // Fall back to name-only
    return [{ name: before_eq || after_eq, strength: null }]
  }
  const percent_match = parseSouthAfricaPercentIngredient(ingredient_string)
  if (percent_match) return [percent_match]

  // Standard: <NAME> <value> <unit>
  const match = ingredient_string.match(ingredient_regex)
  if (match) {
    return [{
      name: match[1].trim(),
      strength: { value: match[2], units: ingredient_string.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim() },
    }]
  }

  // Comma between name and strength: {value: "CAFFEINE ANHYDROUS,32,0 MG"}
  const comma_value_match = ingredient_string.match(new RegExp(`^(.+?),${value_pattern}\\s*${unit_pattern}\\s*$`))
  if (comma_value_match) {
    const units = ingredient_string.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim()
    return [{ name: comma_value_match[1].trim(), strength: { value: comma_value_match[2], units } }]
  }

  // No space between name and strength: {value: "POSACONAZOLE2,08 MG"}
  const no_space_match = ingredient_string.match(new RegExp(`^(.+?)${value_pattern}\\s*${unit_pattern}\\s*$`))
  if (no_space_match && no_space_match[1].length > 1) {
    const units = ingredient_string.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim()
    return [{ name: no_space_match[1].trim(), strength: { value: no_space_match[2], units } }]
  }

  // Range values: "FACTOR XIII 10,0 - 50,0 U" → take first value
  const range_match = ingredient_string.match(new RegExp(`^(.+?)\\s+${value_pattern}\\s*[-–]\\s*\\d+(?:[.,]\\d+)*\\s*${unit_pattern}\\s*$`))
  if (range_match) {
    const units = ingredient_string.match(new RegExp(`${unit_pattern}\\s*$`))![0].trim()
    return [{ name: range_match[1].trim(), strength: { value: range_match[2], units } }]
  }

  // Value with trailing junk after unit: "VALGANCICLOVIR 450 MG 4." → strip trailing junk
  const trailing_junk_match = ingredient_string.match(new RegExp(`^(.+?)\\s+${value_pattern}\\s*(${unit_pattern})\\s+.*$`))
  if (trailing_junk_match) {
    return [{ name: trailing_junk_match[1].trim(), strength: { value: trailing_junk_match[2], units: trailing_junk_match[3].trim() } }]
  }

  // Value with no unit: "ADENINE 0,0293", "RAMIPRIL 1,25", "L-ISOLEUCINE 4,2"
  const no_unit_match = ingredient_string.match(/^(.+?)\s+(\d+(?:[.,]\d+)*)\s*$/)
  if (no_unit_match) {
    throw new Error('No unit match')
  }

  // Name-only ingredient (no numeric value)
  if (/[A-Z]{2,}/.test(ingredient_string)) return [{ name: ingredient_string.trim(), strength: null }]

  // Remaining garbage
  throw new Error(`Could not parse ${ingredient_string}`)
}

/** Extract salt→base form mappings from normalized ingredient text before EQUIVALENT TO is stripped */
type EquivalentToEntry = { name: string; strength: { value: string; units: string } }

function extractEquivalentToNames(normalizedText: string): Map<string, string | EquivalentToEntry> {
  const result = new Map<string, string | EquivalentToEntry>()

  for (const line of normalizedText.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Strip header (EACH ... CONTAINS)
    const content = trimmed.replace(/^EACH\s+.*?CONTAINS?\s*:?\s*/, '').trim()
    if (!content) continue

    // Split on comma+space+uppercase to isolate ingredient segments
    for (const segment of content.split(/,\s+(?=[A-Z])/)) {
      const eq_idx = segment.indexOf('EQUIVALENT TO')
      if (eq_idx === -1) continue

      const raw_salt_name = segment.slice(0, eq_idx).trim().replace(/[,;]\s*$/, '')
      const after_eq = segment.slice(eq_idx + 'EQUIVALENT TO'.length).trim()

      if (!raw_salt_name) continue

      // Strip leading VALUE UNIT from salt name if present (e.g. "50.0 MG SODIUM FLUORIDE" → "SODIUM FLUORIDE")
      const leading_val = raw_salt_name.match(new RegExp(`^\\d+(?:\\.\\d+)*\\s*${unit_pattern}\\s+(.+)$`))
      const salt_name = leading_val ? leading_val[1].trim() : raw_salt_name

      // Format 1: "BASE_NAME VALUE UNIT" (e.g. "FLUORIDE 22.6 MG")
      const base_match = after_eq.match(new RegExp(`^([A-Z][A-Z\\s\\-]+?)\\s+(\\d+(?:\\.\\d+)*)\\s*(${unit_pattern})\\s*$`))
      if (base_match) {
        result.set(salt_name, { name: base_match[1].trim(), strength: { value: base_match[2], units: base_match[3] } })
        continue
      }

      // Format 2: "VALUE UNIT BASE_NAME" (e.g. "500 MG CILASTATIN")
      const base_match_2 = after_eq.match(new RegExp(`^\\d+(?:\\.\\d+)*\\s*${unit_pattern}\\s+([A-Z][A-Z\\s\\-]+)`))
      if (base_match_2) {
        result.set(salt_name, base_match_2[1].trim())
      }
    }
  }

  return result
}

function initialSouthAfricaIngredientMassage(ingredient: string): { text: string; equivalent_to_map: Map<string, string | EquivalentToEntry> } {
  if (ingredient === 'None') {
    throw new Error('No ingredients')
  }

  const upper = ingredient
    .toUpperCase()
    .replace('TABLET\n', 'EACH TABLET CONTAINS')
    .replaceAll(/[\u00B5\u03BC]/g, 'u') // μ → u (micro sign and Greek small mu)
    .replaceAll(/\?G\b/g, 'ug') // corrupted µG → ug
    // Fix letter O used as digit 0 in number-like contexts
    .replaceAll(/(\d)\s+(O+)(?=\s|$)/g, (_, d, os) => d + '0'.repeat(os.length)) // "5 OOO" → "5000"
    .replaceAll(/(\d)(O+)(?=\s|,|$)/g, (_, d, os) => d + '0'.repeat(os.length)) // "2OO" → "200"
    .replaceAll(/(\d),O(?=\s|$)/g, '$1') // "500,O" → "500,0"
    .replaceAll(/\bO,(\d)/g, '0.$1') // "O,25" → "0,25"
    // Join spaced digits: "3 000" → "3000"
    .replaceAll(/(\d)\s+(\d)/g, '$1$2')
    // Fix I.U. / I.U → IU
    .replaceAll(/I\.U\.?/g, 'IU')
    // Fix space before comma in numbers: "60 ,0" → "60.0"
    .replaceAll(/(\d)\s+,(\d)/g, '$1.$2')
    // Fix "EQUIVALENT T0" → "EQUIVALENT TO" (0/O confusion in reverse)
    .replaceAll(/\bEQUIVALENT T0/g, 'EQUIVALENT TO')
    .replaceAll(/, (\d)/g, ',$1')
    .replaceAll(/(\d+),(\d+)/g, '$1.$2')
    // Strip unnecessary .0
    .replaceAll(/(\d)\.0\b/g, '$1')
    // Strip trailing parenthetical text: "(SUCCINYLATED)", "(5 MEGAUNITS)", etc.
    .replace(/\s*\([^)]*\)\s*$/, '')
    // Strip trailing period/whitespace
    .replace(/[\s.]+$/, '')
    .replaceAll('≥ ', '')
    // Handle PEG molecular weight concatenated with value
    .replace(/^(POLY ETHYLENE GLYCOL 3,350)(\d)/, '$1 $2')
    // Fix VITAMIN name+value concatenation: "VITAMIN B650 MG" → "VITAMIN B6 50 MG"
    .replaceAll(/^(VITAMIN\s+[BCDK])(\d{1,2})(\d+(?:[.,]\d+)*\s*(?:MCG|MG|ML|UG|IU|G)\s*$)/g, (_match, prefix: string, vitNum: string, rest: string) => {
      // Known multi-digit vitamin numbers: B12
      if (vitNum.length === 2 && vitNum !== '12') {
        // Split: first digit is vitamin number, second digit starts value
        return `${prefix}${vitNum[0]} ${vitNum[1]}${rest}`
      }
      return `${prefix}${vitNum} ${rest}`
    })
    .replaceAll(/STERILE/g, '') // STERILE yields no semantic meaning
    // Insert space between letter and digit when followed by value+unit at end of string
    // e.g. "MONOHYDRATE1,0 MG" → "MONOHYDRATE 1,0 MG", "SACUBITRIL97,0 MG" → "SACUBITRIL 97,0 MG"
    .replaceAll(
      /([A-Z])(\d+(?:[.,]\d+)*\s*(?:MILLION\s+IU|MEGAUNITS|UG\/ML|IU\/ML|MG\/ML|UG\/CM|UNITS|MCG|MBQ|CCID|MIU|MG|ML|UG|IU|KU|MU|FFU|NG|U|G)\s*$)/g,
      '$1 $2',
    )

  // Extract equivalent_to mappings before stripping EQUIVALENT TO
  const equivalent_to_map = extractEquivalentToNames(upper)

  // Handle "EQUIVALENT TO" by keeping the salt form name with the base form's strength
  // Format 1: "SALT EQUIVALENT TO BASE <value> <unit>" → "SALT <value> <unit>"
  const without_equivalent_to = upper
    .replaceAll(new RegExp(`,?\\s*EQUIVALENT TO\\s+[A-Z][A-Z \\-]*?(?=\\d+(?:\\.\\d+)*\\s*${unit_pattern})`, 'g'), ' ')
    // Format 2: "SALT EQUIVALENT TO <value> <unit> [BASE]" → "SALT <value> <unit>"
    .replaceAll(new RegExp(`,?\\s*EQUIVALENT TO\\s+(\\d+(?:\\.\\d+)*\\s*${unit_pattern})(?:\\s+[A-Z]+(?:\\s+[A-Z]+)*)?`, 'g'), ' $1')

  const text = entries(south_africa_form_rewrite)
    .reduce((t, [needle, replace_with]) => t.replaceAll(needle, replace_with), without_equivalent_to)

  return { text, equivalent_to_map }
}

// Parse header: EACH [<value> <unit> [OF]] [<FORM>] CONTAIN(S) [:]
// EACH 2,0 ml AMPOULE CONTAINS \nVECURONIUM BROMIDE 4,0 mg
const header_regex = /^EACH\s+(?:(\d+(?:[.,]\d+)?)\s*(ML|G|KG|L)\s+(?:OF\s+)?)?(?:([A-Z][A-Z\s,\-]*?)\s+)?CONTAINS?\s*:?\s*/i

// EACH VIAL WITH 5 ML CONCENTRATE CONTAINS 4 MG ZOLEDRONIC ACID (ANHYDROUS) 4.264 MG
const header_regex2 = /^EACH\s+([A-Z]+)\s+WITH\s+(\d+(?:[.,]\d+)?)?\s*((?:ML|G|KG|L))\s+(?:[A-Z]+\s+)?CONTAINS\s*:?\s*/i

// EACH 1,0 ml SOLUTION CONTAINS \nBETAXOLOL HYDROCHLORIDE EQUIVALENT TO BETAXOLOL 5,0 mg
const header_regex3 = /^EACH\s+(\d+(?:[.,]\d+)?)?\s*((?:ML|G|KG|L))\s+([A-Z]+)\s+CONTAINS\s*:?\s+/i

// EACH ml CONTAINS \nBRIMONIDINE TARTRATE 2,0 mg
const header_regex4 = /^EACH\s+(?:(\d+(?:[.,]\d+)?)\s*)?(ML|G|KG|L)\s+CONTAINS\s*:?\s+([\s\S]*)/i

function matchHeader(section: string) {
  const header_match = section.match(header_regex)
  if (header_match) {
    const [full_header, dosage_value, dosage_units, form_raw] = header_match
    return { section, full_header, dosage_value, dosage_units, form_raw, ingredients: section.slice(full_header.length).trim() }
  }

  const header_match2 = section.match(header_regex2)
  if (header_match2) {
    const [full_header, form_raw, dosage_value, dosage_units] = header_match2
    return { section, full_header, form_raw, dosage_value, dosage_units, ingredients: section.slice(full_header.length).trim() }
  }

  const header_match3 = section.match(header_regex3)
  if (header_match3) {
    const [full_header, dosage_value, dosage_units, form_raw] = header_match3
    return { section, full_header, form_raw, dosage_value, dosage_units, ingredients: section.slice(full_header.length).trim() }
  }

  const header_match4 = section.match(header_regex4)
  if (header_match4) {
    const [full_header, value, units, form_raw] = header_match4
    const dosage_value = value ? `${value} ${units}` : `1 ${units}`
    return { section, full_header, form_raw, dosage_value, ingredients: section.slice(full_header.length).trim() }
  }

  // "1 ML\nCHLORPROMAZINE HYDROCHLORIDE A 25 MG" — no EACH, VALUE UNIT on first line
  const header_regex5 = /^(\d+(?:[.,]\d+)?)\s*(ML|G|KG|L)\s*\n/i
  const header_match5 = section.match(header_regex5)
  if (header_match5) {
    const [full_header, dosage_value, dosage_units] = header_match5
    return { section, full_header, dosage_value, dosage_units, ingredients: section.slice(full_header.length).trim() }
  }

  throw new Error(`Could not match section as header ${section}`)
}

function parseSouthAfricaDoseSection(
  { section, dosage_value, dosage_units, form_raw, ingredients: ingredients_str }: {
    section: string
    dosage_value?: string
    dosage_units?: string
    form_raw?: string
    ingredients: string
  },
  form: string,
): ParsedDose {
  let value = dosage_value ? String(positive_decimal.parse(dosage_value)) : '1'
  const dose_form: string = form_raw?.toUpperCase() ||
    forms_with_singular_doses.find((f) => form.includes(f)) || 'DOSE'

  // Split by newline, comma+space+uppercase, semicolon, or concatenated (unit directly followed by uppercase)
  const raw_parts: string[] = []

  for (const line of ingredients_str.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    for (const part of trimmed.split(/(?:,\s+(?=[A-Z]))|(?:;\s*)/).map((s) => s.trim()).filter(Boolean)) {
      // Rearrange "VALUE UNIT NAME VALUE UNIT" → "NAME VALUE UNIT"
      // This fixes leftover base strength from Format 1 stripping of "EQUIVALENT TO BASE": e.g.
      // "50.0 MG SODIUM FLUORIDE  22.6 MG" → "SODIUM FLUORIDE 50.0 MG" (salt keeps its own strength)
      const rearranged_part = part.includes('EQUIVALENT TO') ? part : part.replace(
        new RegExp(`^(\\d+(?:\\.\\d+)*)\\s*(${unit_pattern})\\s+([A-Z][A-Z ()\\-]+?)\\s+(\\d+(?:\\.\\d+)*)\\s*(${unit_pattern})\\s*$`),
        '$3 $1 $2',
      )
      const separated = rearranged_part.includes('EQUIVALENT TO') ? rearranged_part : rearranged_part
        .replace(/(\d+(?:[.,]\d+)?\s*(?:UNITS|MCG|MBQ|CCID|MIU|MG|ML|UG|IU|KU|MU|FFU|NG|U(?!G)|G))\s* OF (.+)/g, '$2 $1\n')
        .replace(/(\d+(?:[.,]\d+)?\s*(?:UNITS|MCG|MBQ|CCID|MIU|MG|ML|UG|IU|KU|MU|FFU|NG|U(?!G)|G))\s*(?=[A-Z])/g, '$1\n')
      raw_parts.push(...separated.split('\n').map((s) => s.trim()).filter(Boolean))
    }
  }

  const ingredients = raw_parts.flatMap(parseSouthAfricaIngredient)

  for (const ingredient of ingredients) {
    if (ingredient.strength?.value.includes(',')) {
      throw new Error(`Strength value included comma ${ingredient.strength.value}`)
    }
    if (ingredient.strength?.value.includes('/')) {
      throw new Error(`Strength value included / ${ingredient.strength.value}`)
    }
  }

  assertArrayNonEmpty(ingredients, `No ingredients parsed: "${section}"`)

  for (const ing of ingredients) {
    // if (ing.dosage_description) {
    //   dosage_description = ing.dosage_description
    // }
    if (ing.dosage_value) {
      value = ing.dosage_value
    }
  }

  if (value.includes('/')) {
    throw new Error('dosage value has /')
  }

  return omitUndefinedProperties({
    value,
    form: dose_form,
    units: dosage_units,
    ingredients,
  })
}
