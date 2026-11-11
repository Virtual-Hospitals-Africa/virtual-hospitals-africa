// @deno-types="../types/s-expression.d.ts"
import s_expression from 's-expression'
import z from 'zod'
import isString from '../util/isString.ts'
import compact from '../util/compact.ts'
import { snomed_category } from '../util/validators.ts'
import { SnomedCategory } from '../db.d.ts'
import { Maybe } from '../types.ts'

/*
  The (medication) s-expression describes one medication a patient is taking. It is deliberately
  its own small language, separate from the (finding) / (clinical_finding) language in
  s_expression_schemas.ts: a medication is never queried by rules in this form, and it carries
  values (numbers with units, a date, free text) the finding language has no place for.

  (medication (snomed_concept "Product containing only cetirizine" "medicinal product")
    (form (snomed_concept "Tablet" "basic dose form"))
    (route (snomed_concept "Oral" "intended site"))
    (strength 10 "mg")
    (dosage 1 "tablet")
    (frequency (snomed_concept "Once daily" "qualifier value"))
    (duration 5 "days")
    (started "2026-11-01")
    (medication_id "0b9e4f0e-...")
    (notes "Taken at night"))

  Only the medicinal product is required. Everything after it is optional and may appear in any
  order; form, route and strength are omitted when the medicinal product implies them.
  strength may repeat, once per active ingredient, in the order the product names them.
*/

export type MedicationSnomedConcept = {
  name: string
  category: SnomedCategory
}

export type MedicationMeasurement = {
  // A positive decimal, kept as the string the user entered
  value: string
  units: string
}

export type Medication = {
  snomed_concept: MedicationSnomedConcept
  form: MedicationSnomedConcept | null
  route: MedicationSnomedConcept | null
  strengths: MedicationMeasurement[]
  dosage: MedicationMeasurement | null
  frequency: MedicationSnomedConcept | null
  duration: MedicationMeasurement | null
  // YYYY-MM-DD
  started: string | null
  // The manufactured (brand) medication, medications.id, when one was picked
  medication_id: string | null
  notes: string | null
}

export const DURATION_UNITS = ['days', 'weeks', 'months', 'years'] as const

type Tree = string | Tree[]

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string }

const ok = <T>(value: T): Parsed<T> => ({ ok: true, value })
const fail = (error: string): Parsed<never> => ({ ok: false, error })

const positive_decimal = /^(\d+(\.\d+)?|\.\d+)$/
const date = /^\d{4}-\d{2}-\d{2}$/
const units = /^[^\s"()\\]{1,32}$/

// The s-expression library returns quoted strings as String objects, so normalize with String()
function leaf(tree: Maybe<Tree>): string | null {
  return isString(tree) ? String(tree) : null
}

function parseSnomedConcept(tree: Maybe<Tree>): Parsed<MedicationSnomedConcept> {
  if (!Array.isArray(tree)) return fail('Expected (snomed_concept "name" "category")')
  const [atom, name_tree, category_tree, ...rest] = tree
  const name = leaf(name_tree)
  const category = snomed_category.safeParse(leaf(category_tree))
  if (leaf(atom) !== 'snomed_concept' || !name || !category.success || rest.length) {
    return fail('Expected (snomed_concept "name" "category")')
  }
  return ok({ name, category: category.data })
}

function parseMeasurement(atom: string, args: Tree[]): Parsed<MedicationMeasurement> {
  const [value_tree, units_tree, ...rest] = args
  const value = leaf(value_tree)
  const measurement_units = leaf(units_tree)
  if (!value || !positive_decimal.test(value) || !(parseFloat(value) > 0) || !measurement_units || !units.test(measurement_units) || rest.length) {
    return fail(`Expected (${atom} <positive number> "<units>")`)
  }
  return ok({ value, units: measurement_units })
}

function parseString(atom: string, args: Tree[], pattern?: RegExp): Parsed<string> {
  const [value_tree, ...rest] = args
  const value = leaf(value_tree)
  if (value === null || !value.trim() || rest.length || (pattern && !pattern.test(value))) {
    return fail(`Expected (${atom} "<value>")`)
  }
  return ok(value)
}

const uuid = z.string().uuid()

export function parseMedicationSExpression(expression: string): Parsed<Medication> {
  const tree = s_expression(expression)
  if (tree instanceof Error || !Array.isArray(tree)) return fail(`Not an s-expression: ${expression}`)
  const [atom, snomed_concept_tree, ...rest] = tree
  if (leaf(atom) !== 'medication') return fail('Expected (medication ...)')

  const snomed_concept = parseSnomedConcept(snomed_concept_tree)
  if (!snomed_concept.ok) return snomed_concept
  if (snomed_concept.value.category !== 'medicinal product') {
    return fail('A medication must be a medicinal product')
  }

  const medication: Medication = {
    snomed_concept: snomed_concept.value,
    form: null,
    route: null,
    strengths: [],
    dosage: null,
    frequency: null,
    duration: null,
    started: null,
    medication_id: null,
    notes: null,
  }

  const seen = new Set<string>()
  for (const child of rest) {
    if (!Array.isArray(child)) return fail(`Unexpected ${child}`)
    const [child_atom_tree, ...args] = child
    const child_atom = leaf(child_atom_tree)
    if (!child_atom) return fail('Expected an atom')
    if (child_atom !== 'strength' && seen.has(child_atom)) return fail(`${child_atom} given more than once`)
    seen.add(child_atom)

    switch (child_atom) {
      case 'form':
      case 'route':
      case 'frequency': {
        const [concept_tree, ...extra] = args
        const concept = parseSnomedConcept(concept_tree)
        if (!concept.ok) return concept
        if (extra.length) return fail(`Expected (${child_atom} (snomed_concept ...))`)
        medication[child_atom] = concept.value
        break
      }
      case 'strength': {
        const strength = parseMeasurement(child_atom, args)
        if (!strength.ok) return strength
        medication.strengths.push(strength.value)
        break
      }
      case 'dosage':
      case 'duration': {
        const measurement = parseMeasurement(child_atom, args)
        if (!measurement.ok) return measurement
        medication[child_atom] = measurement.value
        break
      }
      case 'started': {
        const started = parseString(child_atom, args, date)
        if (!started.ok) return fail('Expected (started "YYYY-MM-DD")')
        medication.started = started.value
        break
      }
      case 'medication_id': {
        const medication_id = parseString(child_atom, args)
        if (!medication_id.ok || !uuid.safeParse(medication_id.value).success) return fail('Expected (medication_id "<uuid>")')
        medication.medication_id = medication_id.value
        break
      }
      case 'notes': {
        const notes = parseString(child_atom, args)
        if (!notes.ok) return notes
        medication.notes = notes.value
        break
      }
      default:
        return fail(`Unknown medication attribute ${child_atom}`)
    }
  }

  return ok(medication)
}

function quote(str: string): string {
  return `"${str.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n')}"`
}

function conceptToString({ name, category }: MedicationSnomedConcept): string {
  return `(snomed_concept ${quote(name)} ${quote(category)})`
}

function measurementToString(atom: string, { value, units }: MedicationMeasurement): string {
  return `(${atom} ${value} ${quote(units)})`
}

// The normal form: attributes always in this order, so two equal medications have equal strings
export function medicationToSExpression(medication: Medication): string {
  const parts = compact([
    conceptToString(medication.snomed_concept),
    medication.form && `(form ${conceptToString(medication.form)})`,
    medication.route && `(route ${conceptToString(medication.route)})`,
    ...medication.strengths.map((strength) => measurementToString('strength', strength)),
    medication.dosage && measurementToString('dosage', medication.dosage),
    medication.frequency && `(frequency ${conceptToString(medication.frequency)})`,
    medication.duration && measurementToString('duration', medication.duration),
    medication.started && `(started ${quote(medication.started)})`,
    medication.medication_id && `(medication_id ${quote(medication.medication_id)})`,
    medication.notes && `(notes ${quote(medication.notes)})`,
  ])
  return `(medication ${parts.join(' ')})`
}

export const medication = z.string().transform((expression, ctx): Medication => {
  const parsed = parseMedicationSExpression(expression)
  if (parsed.ok) return parsed.value
  ctx.addIssue({ code: 'custom', message: parsed.error })
  return z.NEVER
}).describe('medication')

/*
  "Product containing only amoxicillin and clavulanic acid" -> "amoxicillin + clavulanic acid"
  A medicinal product is named for its active ingredients, which is how people refer to it.
*/
export function activeIngredientsDisplay(medicinal_product_name: string): string {
  return medicinal_product_name
    .replace(/^Product containing (only |precisely )?/i, '')
    .replace(/ in .* dose form$/i, '')
    .replaceAll(/,? and /g, ' + ')
    .replaceAll(', ', ' + ')
}

function measurementDisplay({ value, units }: MedicationMeasurement, separator = ''): string {
  return `${value}${separator}${units}`
}

function pluralized({ value, units }: MedicationMeasurement): string {
  const singular = units.replace(/s$/, '')
  return `${value} ${parseFloat(value) === 1 ? singular : singular + 's'}`
}

export type MedicationDisplay = {
  // "10mg", or "500mg/125mg" for a product with several active ingredients
  strength: string | null
  // "cetirizine"
  name: string
  // "tablet"
  form: string | null
  // "1 tablet once daily for 5 days"
  schedule: string | null
  // "10mg cetirizine tablet"
  short: string
  // "10mg cetirizine tablet, 1 tablet once daily for 5 days"
  full: string
}

export function medicationDisplay(medication: Medication): MedicationDisplay {
  const strength = medication.strengths.length ? medication.strengths.map((s) => measurementDisplay(s)).join('/') : null
  const name = activeIngredientsDisplay(medication.snomed_concept.name)
  const form = medication.form ? medication.form.name.toLowerCase() : null
  const schedule = compact([
    medication.dosage && pluralized(medication.dosage),
    medication.frequency && medication.frequency.name.toLowerCase(),
    medication.duration && `for ${pluralized(medication.duration)}`,
  ]).join(' ') || null
  const short = compact([strength, name, form]).join(' ')
  return {
    strength,
    name,
    form,
    schedule,
    short,
    full: compact([short, schedule]).join(', '),
  }
}
