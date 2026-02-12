import { sql } from 'kysely'
import { z } from 'zod'
import { InsertRows, NonNullableProperty, TrxOrDb } from '../../../types.ts'
import generateUUID from '../../../util/uuid.ts'
import parseJSON from '../../../util/parseJSON.ts'

import { assert } from 'std/assert/assert.ts'
import { define } from '../define.ts'
import { positive_decimal } from '../../../util/validators.ts'
import { humanReadableJson } from '../../../util/humanReadableJson.ts'
import { parseWithValues } from '../../../util/assertMatches.ts'

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
], addSeedDataFromJSON)

const unaffiliated_form_to_route: Record<string, string[]> = {
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
  // SA-specific forms
  AMPOULE: ['INJECTION'],
  DROPS: ['TOPICAL', 'ORAL'],
  LOZENGE: ['ORAL'],
  OINTMENT: ['TOPICAL'],
  PATCH: ['TOPICAL'],
  POWDER: ['ORAL', 'TOPICAL'],
  SACHET: ['ORAL'],
  SPRAY: ['NASAL', 'ORAL', 'TOPICAL'],
  SUPPOSITORY: ['RECTAL', 'VAGINAL'],
  SYRINGE: ['INJECTION'],
  SYRUP: ['ORAL'],
  VIAL: ['INJECTION'],
  // SA tablet variants
  'FILM-COATED TABLET': ['ORAL'],
  'FILM COATED TABLET': ['ORAL'],
  'ACTIVE TABLET': ['ORAL'],
  'EFFERVESCENT TABLET': ['ORAL'],
  'ORODISPERSIBLE TABLET': ['ORAL'],
  'CHEWABLE TABLET': ['ORAL'],
  'CHEW TABLET': ['ORAL'],
  'DISPERSIBLE TABLET': ['ORAL'],
  'UNCOATED TABLET': ['ORAL'],
  'ENTERIC COATED TABLET': ['ORAL'],
  'GASTRO-RESISTANT TABLET': ['ORAL'],
  'PROLONGED RELEASE TABLET': ['ORAL'],
  'SUSTAINED RELEASE  FILM COATED TABLET': ['ORAL'],
  'SUBLINGUAL TABLET': ['SUBLINGUAL'],
  'VAGINAL TABLET': ['VAGINAL'],
  'PINK TABLET': ['ORAL'],
  'BROWN TABLET': ['ORAL'],
  // SA capsule variants
  'HARD CAPSULE': ['ORAL'],
  'SOFTGEL CAPSULE': ['ORAL'],
  'CAPSULE FOR INHALATION': ['INHALATION'],
  'INHALATION CAPSULE': ['INHALATION'],
  'SPRINKLE CAPSULE': ['ORAL'],
  // SA syringe/injection containers
  'PRE-FILLED SYRINGE': ['INJECTION'],
  'PRE-FILLED SYRINGE OR PEN': ['INJECTION'],
  'PENFILL CARTRIDGE': ['INJECTION'],
  CARTRIDGE: ['INJECTION'],
  'SINGLE DOSE VIAL': ['INJECTION'],
  INJECTION: ['INJECTION'],
  INFUSION: ['INJECTION'],
  'INFUSION SOLUTION': ['INJECTION'],
  'INFUSION BAG': ['INJECTION'],
  'STERILE SOLUTION': ['INJECTION'],
  'STERILE EMULSION': ['INJECTION'],
  CONCENTRATE: ['INJECTION'],
  DEPOT: ['INJECTION'],
  BAG: ['INJECTION'],
  'ONE ML INJECTION': ['INJECTION'],
  'OILY SOLUTION': ['INJECTION'],
  // SA inhalation variants
  EMULSION: ['INJECTION', 'TOPICAL'],
  'METERED DOSE': ['INHALATION'],
  'DELIVERED DOSE': ['INHALATION'],
  'METERED ACTUATION': ['INHALATION'],
  ACTUATION: ['INHALATION'],
  'SINGLE ACTUATION': ['INHALATION'],
  'SINGLE INHALATION': ['INHALATION'],
  PUFF: ['INHALATION'],
  'METERED-DOSE': ['INHALATION'],
  'UNIT DOSE': ['INHALATION'],
  BLISTER: ['INHALATION'],
  RESPULE: ['INHALATION'],
  AEROSOL: ['INHALATION', 'TOPICAL'],
  CYLINDER: ['INHALATION'],
  CONTAINER: ['INHALATION'],
  'DOSAGE UNIT': ['INHALATION'],
  // SA nasal/spray variants
  'METERED SPRAY': ['NASAL', 'ORAL', 'TOPICAL'],
  'METERED DOSE SPRAY': ['NASAL', 'ORAL', 'TOPICAL'],
  'SPRAY ACTUATION': ['NASAL', 'ORAL', 'TOPICAL'],
  'SINGLE DOSE NASAL SPRAY': ['NASAL'],
  'NASAL SPRAY DEVICE': ['NASAL'],
  'DROPS OR METERED SPRAY': ['NASAL', 'TOPICAL'],
  'ORAL SPRAY SOLUTION': ['ORAL'],
  'SPRAY SOLUTION': ['TOPICAL'],
  // SA ophthalmic
  'EYE DROPS': ['OPHTHALMIC'],
  'OPHTHALMIC SUSPENSION': ['OPHTHALMIC'],
  'OPHTHALMIC OINTMENT': ['OPHTHALMIC'],
  'OPHTHALMIC SOLUTION': ['OPHTHALMIC'],
  // SA oral forms
  ELIXIR: ['ORAL'],
  GRANULES: ['ORAL'],
  CAPLET: ['ORAL'],
  GUM: ['ORAL'],
  MIXTURE: ['ORAL', 'INJECTION'],
  TEA: ['ORAL'],
  LEAVES: ['ORAL'],
  SALT: ['ORAL'],
  'ML ELIXIR': ['ORAL'],
  // SA topical
  IMPLANT: ['INJECTION'],
  'INTRAVITREAL IMPLANT': ['INJECTION'],
  OIL: ['TOPICAL'],
  PLASTER: ['TOPICAL'],
  FOAM: ['TOPICAL'],
  'CUTANEOUS FOAM': ['TOPICAL'],
  SHAMPOO: ['TOPICAL'],
  'MEDICATED DISC': ['TOPICAL'],
  'MEDICATED DISK': ['TOPICAL'],
  'TRANSDERMAL THERAPEUTIC SYSTEM': ['TOPICAL'],
  DRESSING: ['TOPICAL'],
  SWAB: ['TOPICAL'],
  'SWAB IS IMPREGNATED WITHSOLUTION': ['TOPICAL'],
  STICK: ['TOPICAL'],
  LACQUER: ['TOPICAL'],
  JELLY: ['TOPICAL'],
  JAR: ['TOPICAL'],
  'AQUEOUS GEL': ['TOPICAL'],
  'RECONSTITUTED GEL': ['TOPICAL'],
  'TOPICAL SUSPENSION': ['TOPICAL'],
  GRAM: ['TOPICAL'],
  'GRAM OF CREAM': ['TOPICAL'],
  'GRAM OINTMENT': ['TOPICAL'],
  'GRAM SOLUTION': ['TOPICAL'],
  G: ['TOPICAL'],
  'SQUARE CM PATCH': ['TOPICAL'],
  'NAIL LACUER': ['TOPICAL'],
  TOWLETTE: ['TOPICAL'],
  TOWELETTTE: ['TOPICAL'],
  // SA vaginal
  PESSARY: ['VAGINAL'],
  'VAGINAL RING': ['VAGINAL'],
  'VAGINAL SUPPOSITORY': ['VAGINAL'],
  'VAGINAL CREAM': ['VAGINAL'],
  'VAGINAL GEL': ['VAGINAL'],
  OVULE: ['VAGINAL'],
  TAMPON: ['VAGINAL'],
  SPONGE: ['VAGINAL'],
  'INTRAUTERINE SYSTEM': ['VAGINAL'],
  'IUD SYSTEM': ['VAGINAL'],
  DEVICE: ['VAGINAL'],
  SYSTEM: ['VAGINAL'],
  // SA rectal
  ENEMA: ['RECTAL'],
  'RECONSTITUTED ENEMA': ['RECTAL'],
  // SA suspension/solution variants
  'RECONSTITUTED SUSPENSION': ['ORAL'],
  'VISCOUS SUSPENSION': ['ORAL', 'TOPICAL'],
  // SA container/packaging forms
  BOTTLE: ['ORAL', 'TOPICAL'],
  'BLISTER PACK': ['ORAL'],
  'SINGLE BLISTER PACK': ['INJECTION'],
  PACK: ['ORAL'],
  'COMBI PACK': ['ORAL'],
  COMBIPACK: ['ORAL'],
  'COMBINATION PACK': ['INJECTION'],
  'DUAL-PACK': ['VAGINAL'],
  WALLET: ['ORAL'],
  PACKET: ['ORAL'],
  POUCH: ['ORAL'],
  'POUCH OR SCOOP': ['ORAL'],
  'INDIVIDUALLY WRAPPED POWDER': ['ORAL'],
  ML: ['INJECTION', 'TOPICAL'],
  'ML SOLUTION': ['INJECTION', 'TOPICAL'],
  'ML OF SOLUTION': ['INJECTION', 'TOPICAL'],
  'I ML': ['INJECTION'],
  MILLILITRE: ['INJECTION', 'TOPICAL'],
  // SA edge cases
  STENT: ['INJECTION'],
  PREMIX: ['ORAL'],
  LIQUER: ['ORAL'],
  KIT: ['INJECTION'],
  UNIT: ['INJECTION'],
  'WHEN DILUTED': ['INJECTION'],
  'FENWAL BLOOD-PACK UNID -ADSOL': ['INJECTION'],
}

// Misspelling corrections: maps typos to canonical forms in unaffiliated_form_to_route
const sa_form_rewrite: Record<string, string> = {
  'ATBLET': 'TABLET',
  'TABET': 'TABLET',
  'TABLE': 'TABLET',
  'TABLER': 'TABLET',
  'TALBET': 'TABLET',
  'TABELT': 'TABLET',
  'TABLTE': 'TABLET',
  'TABLAET': 'TABLET',
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

// Try to infer form and routes from the product name
function inferFormRoutesFromProductName(productName: string): { form: string; routes: string[] } | null {
  const upper = productName.toUpperCase()

  // "X FOR Y" patterns like "SUSPENSION FOR INJECTION"
  const forMatch = upper.match(/\b(SUSPENSION|SOLUTION|POWDER|CONCENTRATE)\s+FOR\s+(INJECTION|INFUSION|INHALATION|ORAL USE)\b/)
  if (forMatch) {
    const route = forMatch[2] === 'INFUSION' ? 'INJECTION' : forMatch[2] === 'ORAL USE' ? 'ORAL' : forMatch[2]
    return { form: forMatch[1], routes: [route] }
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

type MedicationCsvRow = {
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

async function seedDataFromJSONZimbabwe() {
  const zimbabwe_medications: MedicationCsvRow[] = await parseJSON(
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
        medication,
        // deno-lint-ignore no-explicit-any
        reason: (e as any).message,
      })
    }
  })

  Deno.writeTextFileSync('./db/resources/12_inventory_medication_zimbabwe_failed_imports.json', humanReadableJson(failed_zimbabwe))
  return parsed
}

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

async function seedDataFromJSONSouthAfrica() {
  const za_medications = parseWithValues(za_schema.array(), await parseJSON('./db/resources/sahpra.json'))
  const registered_za_medications = za_medications.filter(({ status }) => status === 'Registered')

  const productFormRoutesLookup: Record<string, [string, string[]]> = await parseJSON(
    './db/resources/claude_generated_probable_south_african_product_form_routes.json',
  )

  // deno-lint-ignore no-explicit-any
  const failed_south_africa: any[] = []
  const parsed = compactMap(registered_za_medications, (medication) => {
    try {
      return parseMedicationSouthAfrica(medication, productFormRoutesLookup)
    } catch (e) {
      failed_south_africa.push({
        medication,
        // deno-lint-ignore no-explicit-any
        reason: (e as any).message,
      })
    }
  })
  Deno.writeTextFileSync('./db/resources/12_inventory_medication_south_africa_failed_imports.json', humanReadableJson(failed_south_africa))
  return parsed
}

type ParsedSAIngredient = { name: string; value: string; unit: string; denominator_value?: string; denominator_unit?: string }

function parseSAPercentIngredient(part: string): ParsedSAIngredient | null {
  const percentRegex = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:%|PERCENT)\s*(W\/W|W\/V|M\/V|V\/V)?\s*$/
  const match = part.match(percentRegex)
  if (!match) return null
  const [, name, value, qualifier] = match
  // Same logic as Zimbabwe's parseSingleStrength for percentage strengths
  if (qualifier === 'V/V') {
    return { name: name.trim(), value, unit: 'ML', denominator_value: '100', denominator_unit: 'ML' }
  }
  if (qualifier === 'W/V' || qualifier === 'M/V') {
    return { name: name.trim(), value, unit: 'G', denominator_value: '100', denominator_unit: 'ML' }
  }
  // Default (no qualifier, W/W, or bare %): assume by weight
  return { name: name.trim(), value, unit: 'G', denominator_value: '100', denominator_unit: 'G' }
}

function parseSAIngredient(part: string): ParsedSAIngredient {
  part = part.replace(/, (\d)/, ',$1')
  const unitPattern = '(?:MCG|MG|ML|UG|IU|G)'
  const ingredientRegex = new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s*$`)

  const eqIdx = part.indexOf('EQUIVALENT TO')
  if (eqIdx !== -1) {
    const afterEq = part.slice(eqIdx + 'EQUIVALENT TO'.length).trim()
    // Try: <value> <unit> <DRUG_NAME> (e.g. "500,0 MG ERYTHROMYCIN")
    const match1 = afterEq.match(new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s+(.+)$`))
    if (match1) return { name: match1[2].trim(), value: match1[1], unit: afterEq.match(new RegExp(unitPattern))![0] }

    // Try: <DRUG_NAME> <value> <unit> (e.g. "APOMORPHINE 2,0 MG")
    const match2 = afterEq.match(ingredientRegex)
    if (match2) return { name: match2[1].trim(), value: match2[2], unit: afterEq.match(new RegExp(`${unitPattern}\\s*$`))![0].trim() }

    throw new Error(`Could not parse EQUIVALENT TO ingredient: "${part}"`)
  }

  const percentMatch = parseSAPercentIngredient(part)
  if (percentMatch) return percentMatch

  const match = part.match(ingredientRegex)
  if (!match) throw new Error(`Could not parse ingredient: "${part}"`)
  return { name: match[1].trim(), value: match[2], unit: part.match(new RegExp(`${unitPattern}\\s*$`))![0].trim() }
}

function parseMedicationSouthAfrica(
  medication: z.infer<typeof za_schema>,
  productFormRoutesLookup: Record<string, [string, string[]]>,
): ParsedMedication {
  const ingredient = medication.ingredient
  const base = {
    trade_name: medication.productName,
    forms: '',
    strength: ingredient,
    category: '',
    registration_no: medication.licence_no,
    applicant_name: medication.applicantName,
    manufacturers: medication.applicantName,
    country: 'ZA',
  }

  if (ingredient === 'None') {
    throw new Error('No ingredients')
  }

  const upper = ingredient
    .replace(/[\u00B5\u03BC]/g, 'u') // μ → u (micro sign and Greek small mu)
    .toUpperCase()
    .replace(/(\d)\s+(\d)/g, '$1$2') // 3 000 → 3000

  // Parse header: EACH [<value> <unit> [OF]] [<FORM>] CONTAIN(S) [:]
  const header_regex = /^EACH\s+(?:(\d+(?:[.,]\d+)?)\s*(ML|G|KG|L)\s+(?:OF\s+)?)?(?:([A-Z][A-Z\s,\-]*?)\s+)?CONTAINS?\s*:?\s*/
  const header_match = upper.match(header_regex)
  if (!header_match) {
    throw new Error(`Could not parse ingredient header: "${upper}"`)
  }

  const [full_header, denominator_value_raw, denominator_unit_raw, form_raw] = header_match
  let form = form_raw?.trim() || (denominator_unit_raw ? 'LIQUID' : null)

  // Fallback 1: if form could not be determined, try inferring from product name
  if (!form) {
    const inferred = inferFormRoutesFromProductName(medication.productName)
    if (inferred) {
      form = inferred.form
    }
  }

  if (!form) {
    // Fallback 2: try the JSON lookup
    const lookup = productFormRoutesLookup[medication.productName]
    if (lookup) {
      form = lookup[0]
    }
  }

  if (!form) {
    throw new Error(`Could not determine form: "${ingredient}"`)
  }

  // Apply misspelling rewrites
  form = sa_form_rewrite[form] ?? form

  const denominator_value = denominator_value_raw ? String(positive_decimal.parse(denominator_value_raw.replace(',', '.'))) : '1'
  const currentForm = form
  const denominator_unit = denominator_unit_raw?.toUpperCase() ||
    forms_with_singular_doses.find((f) => currentForm.includes(f)) ||
    'DOSE'

  // Look up routes from the form-to-route map
  let routes: string[] | undefined = unaffiliated_form_to_route[form]

  // Fallback: try inferring form/routes from the product name
  if (!routes) {
    const inferred = inferFormRoutesFromProductName(medication.productName)
    if (inferred) {
      form = inferred.form
      routes = inferred.routes
    }
  }

  // Fallback: try the JSON product name lookup (primarily for DOSE)
  if (!routes) {
    const lookup = productFormRoutesLookup[medication.productName]
    if (lookup) {
      form = lookup[0]
      routes = lookup[1]
    }
  }

  if (!routes) {
    throw new Error(`No routes for form: "${form}"`)
  }

  // Parse individual ingredients from text after header
  const ingredients_part = upper.slice(full_header.length).trim()
  if (!ingredients_part) {
    throw new Error(`No ingredients after header: "${ingredient}"`)
  }

  // Split by newline, comma+space+uppercase, semicolon, or concatenated (unit directly followed by uppercase)
  const rawParts: string[] = []
  for (const line of ingredients_part.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    for (const part of trimmed.split(/(?:,\s+(?=[A-Z]))|(?:;\s*)/).map((s) => s.trim()).filter(Boolean)) {
      const separated = part.replace(/(\d+(?:[.,]\d+)?\s*(?:MCG|MG|ML|UG|IU|G))\s*(?=[A-Z])/g, '$1\n')
      rawParts.push(...separated.split('\n').map((s) => s.trim()).filter(Boolean))
    }
  }

  const drug_ingredients: string[] = []
  const strengths: NonNullableProperty<ParsedStrengths, 'strength_numerator_unit'>[] = []

  for (const part of rawParts) {
    const parsed = parseSAIngredient(part)
    drug_ingredients.push(parsed.name)
    strengths.push({
      strength_numerator: String(positive_decimal.parse(parsed.value.replace(',', '.'))),
      strength_numerator_unit: parsed.unit,
      strength_denominator: parsed.denominator_value ?? denominator_value,
      strength_denominator_unit: parsed.denominator_unit ?? denominator_unit,
    })
  }

  if (drug_ingredients.length === 0) {
    throw new Error(`No ingredients parsed: "${ingredient}"`)
  }

  return {
    ...base,
    drug_ingredients,
    strengths,
    form,
    forms: form,
    routes,
    strength_denominator: denominator_value,
    strength_denominator_unit: denominator_unit,
  }
}

async function insertMedications(
  trx: TrxOrDb,
  medications: ParsedMedication[],
) {
  const drug_ingredient_ids_by_name = new Map<string, string>()
  for (const medication of medications) {
    for (const name of medication.drug_ingredients) {
      if (!drug_ingredient_ids_by_name.has(name)) {
        drug_ingredient_ids_by_name.set(name, generateUUID())
      }
    }
  }

  const insert_drug_ingredients: InsertRows<'drug_ingredients'> = [...drug_ingredient_ids_by_name].map(([name, id]) => ({ id, name }))
  const insert_consumables: InsertRows<'consumables'> = []
  const insert_medications: InsertRows<'medications'> = []
  const insert_ingredients: InsertRows<'medication_ingredients'> = []
  const insert_availabilities: InsertRows<'medication_availabilities'> = []

  for (const medication of medications) {
    const consumable_id = generateUUID()
    const medication_id = generateUUID()

    insert_consumables.push({ id: consumable_id, name: medication.trade_name, is_medication: true })

    insert_medications.push({
      id: medication_id,
      trade_name: medication.trade_name,
      applicant_name: medication.applicant_name,
      manufacturer_name: medication.manufacturers,
      form: medication.form,
      routes: medication.routes,
      consumable_id,
      strength_denominator: medication.strengths[0].strength_denominator,
      strength_denominator_unit: medication.strengths[0].strength_denominator_unit,
    })

    for (let i = 0; i < medication.drug_ingredients.length; i++) {
      insert_ingredients.push({
        medication_id,
        drug_ingredient_id: drug_ingredient_ids_by_name.get(medication.drug_ingredients[i])!,
        strength_numerator: medication.strengths[i].strength_numerator,
        strength_numerator_unit: medication.strengths[i].strength_numerator_unit,
      })
    }

    insert_availabilities.push({ medication_id, country: medication.country })
  }

  await trx
    .with('inserting_drug_ingredients', (qb) =>
      qb.insertInto('drug_ingredients').values(insert_drug_ingredients)
    )
    .with('inserting_consumables', (qb) =>
      qb.insertInto('consumables').values(insert_consumables)
    )
    .with('inserting_medications', (qb) =>
      qb.insertInto('medications').values(insert_medications)
    )
    .with('inserting_medication_ingredients', (qb) =>
      qb.insertInto('medication_ingredients').values(insert_ingredients)
    )
    .with('inserting_medication_availabilities', (qb) =>
      qb.insertInto('medication_availabilities').values(insert_availabilities)
    )
    .selectNoFrom(sql<true>`true`.as('success'))
    .execute()
}

async function addSeedDataFromJSON(trx: TrxOrDb) {
  const medications = await Promise.all([
    seedDataFromJSONZimbabwe(),
    seedDataFromJSONSouthAfrica(),
  ]).then((ms) => ms.flat())
  await insertMedications(trx, medications)
}

function parseMedicationZimbabwe(
  medication: MedicationCsvRow,
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
    country: 'ZW',
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
