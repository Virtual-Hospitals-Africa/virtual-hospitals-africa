import keys from '../util/keys.ts'

export const PRIORITY_SNOMED_CODES = {
  'Normal': '394848005',
  'Non-urgent': '1357728000',
  'Urgent': '103391001',
  'Very urgent': '1356878002',
  'Emergency': '25876001',
}

export const PRIORITIES = keys(PRIORITY_SNOMED_CODES)

export type Priority = (typeof PRIORITIES)[number]

export function isPriority(priority: string): priority is Priority {
  return priority in PRIORITY_SNOMED_CODES
}

export type TriageLevel =
  | 'Non-urgent'
  | 'Urgent'
  | 'Very urgent'
  | 'Emergency'

export const TARGET_TIME_TO_TREATMENT_MINUTES = {
  'Non-urgent': 240,
  'Urgent': 60,
  'Very urgent': 10,
  'Emergency': 0,
}

export function isTriageLevel(priority: string): priority is TriageLevel {
  return priority in TARGET_TIME_TO_TREATMENT_MINUTES
}
