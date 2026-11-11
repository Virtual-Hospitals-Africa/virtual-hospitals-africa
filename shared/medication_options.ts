import type { MedicinalProductOption } from '../types.ts'
import {
  AS_REQUIRED,
  EVERY_EVENING,
  EVERY_MORNING,
  FOUR_TIMES_DAILY,
  ONCE_A_DAY_AT_BEDTIME,
  ONCE_A_WEEK,
  ONCE_DAILY,
  ONCE_MONTHLY,
  THREE_TIMES_DAILY,
  TWICE_A_DAY,
} from './snomed_concepts.ts'
import type { Medication, MedicationMeasurement, MedicationSnomedConcept } from './medication_s_expression.ts'

// How often a medication is taken, as the SNOMED concepts a medication's frequency may be
export const MEDICATION_FREQUENCIES = [
  ONCE_DAILY,
  TWICE_A_DAY,
  THREE_TIMES_DAILY,
  FOUR_TIMES_DAILY,
  EVERY_MORNING,
  EVERY_EVENING,
  ONCE_A_DAY_AT_BEDTIME,
  ONCE_A_WEEK,
  ONCE_MONTHLY,
  AS_REQUIRED,
]

export function strengthsKey(strengths: MedicationMeasurement[]): string {
  return strengths.map(({ value, units }) => `${value}${units}`).join('/')
}

function distinct<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const item_key = key(item)
    if (seen.has(item_key)) return false
    seen.add(item_key)
    return true
  })
}

function present<T>(item: T | null): item is T {
  return item !== null
}

export type MedicationChoices = {
  // What there is to choose between. A list of one is no choice: it is implied.
  forms: MedicationSnomedConcept[]
  strengths: MedicationMeasurement[][]
  routes: MedicationSnomedConcept[]
  // What is in effect: the one implied, else the one chosen, else null
  form: MedicationSnomedConcept | null
  strength: MedicationMeasurement[] | null
  route: MedicationSnomedConcept | null
  // What a dose is counted in ("tablet", "mL"), when what is in effect settles it
  dosage_units: string | null
}

type Chosen = {
  form: string | null
  // As strengthsKey gives
  strength: string | null
  route: string | null
}

/*
  A medicinal product comes in the forms, strengths and routes of the clinical drugs descended
  from it (its options). Each choice narrows the next: the strengths on offer are those of the
  form in effect, and the routes those of the form and strength in effect. Where only one remains
  there is nothing to ask: it is implied by the medicinal product and what was already chosen.
*/
export function medicationChoices(options: MedicinalProductOption[], chosen: Chosen): MedicationChoices {
  const forms = distinct(options.map((option) => option.form).filter(present), (form) => form.name)
  const form = forms.length === 1 ? forms.find(() => true)! : forms.find((candidate) => candidate.name === chosen.form) ?? null
  const of_form = form ? options.filter((option) => option.form?.name === form.name) : options

  const strengths = distinct(of_form.map((option) => option.strengths).filter((option_strengths) => option_strengths.length), strengthsKey)
  const strength = strengths.length === 1 ? strengths.find(() => true)! : strengths.find((candidate) => strengthsKey(candidate) === chosen.strength) ?? null
  const of_strength = strength ? of_form.filter((option) => strengthsKey(option.strengths) === strengthsKey(strength)) : of_form

  const routes = distinct(of_strength.map((option) => option.route).filter(present), (route) => route.name)
  const route = routes.length === 1 ? routes.find(() => true)! : routes.find((candidate) => candidate.name === chosen.route) ?? null
  const of_route = route ? of_strength.filter((option) => option.route?.name === route.name) : of_strength

  const dosage_units = distinct(of_route.map((option) => option.dosage_units).filter(present), (units) => units)

  return {
    forms,
    strengths,
    routes,
    form,
    strength,
    route,
    dosage_units: dosage_units.length === 1 ? dosage_units.find(() => true)! : null,
  }
}

function chosenOf(medication: Medication): Chosen {
  return {
    form: medication.form?.name ?? null,
    strength: medication.strengths.length ? strengthsKey(medication.strengths) : null,
    route: medication.route?.name ?? null,
  }
}

/*
  A medication records its form, strength and route only where they were a choice. To describe
  the medication in full, what its medicinal product implies is filled back in.
*/
export function withImplied(medication: Medication, options: MedicinalProductOption[]): Medication {
  const choices = medicationChoices(options, chosenOf(medication))
  return {
    ...medication,
    form: medication.form ?? choices.form,
    strengths: medication.strengths.length ? medication.strengths : choices.strength ?? [],
    route: medication.route ?? choices.route,
  }
}

// The inverse of withImplied: what is implied need not be recorded
export function withoutImplied(medication: Medication, options: MedicinalProductOption[]): Medication {
  const choices = medicationChoices(options, chosenOf(medication))
  return {
    ...medication,
    form: choices.forms.length > 1 ? medication.form : null,
    strengths: choices.strengths.length > 1 ? medication.strengths : [],
    route: choices.routes.length > 1 ? medication.route : null,
  }
}
