import entries from '../util/entries.ts'
import keys from '../util/keys.ts'
import sortBy from '../util/sortBy.ts'

export const PRIORITY_SNOMED_CONCEPT_ID = '260870009' // |Priority (attribute)|

export const PRIORITY_SNOMED_CODES = {
  'Non-urgent': '1357728000',
  'Urgent': '103391001',
  'Very urgent': '1356878002',
  'Emergency': '25876001',
  'Deceased': '419620001', // Death (event)
}

export type Priority = keyof typeof PRIORITY_SNOMED_CODES

export const PRIORITIES = keys(PRIORITY_SNOMED_CODES)

export function isPriority(priority: string): priority is Priority {
  return priority in PRIORITY_SNOMED_CODES
}

export type TriageLevel =
  | 'Non-urgent'
  | 'Urgent'
  | 'Very urgent'
  | 'Emergency'
  | 'Deceased'

export const TARGET_TIME_TO_TREATMENT_MINUTES = {
  'Non-urgent': 240,
  'Urgent': 60,
  'Very urgent': 10,
  'Emergency': 0,
  'Deceased': 120,
}

export const ORDERED_PRIORITIES = sortBy(
  entries(TARGET_TIME_TO_TREATMENT_MINUTES),
  ([, minutes]) => minutes,
).map(([priority]) => priority)

export const TRIAGE_LEVELS = keys(TARGET_TIME_TO_TREATMENT_MINUTES)

export function isTriageLevel(priority: string): priority is TriageLevel {
  return priority in TARGET_TIME_TO_TREATMENT_MINUTES
}

export const PRIORITY_COLORS: Record<
  Priority | 'Normal',
  { bg: string; text: string; border: string }
> = {
  Normal: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  'Non-urgent': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  Urgent: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  'Very urgent': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  Emergency: {
    bg: 'bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
  },
  Deceased: {
    bg: 'bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
  },
}
