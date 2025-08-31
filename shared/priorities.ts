import { keys } from '../util/keys.ts'

export const PRIORITY_SNOMED_CODES = {
  'Normal': '394848005',
  'Non-urgent': '1357728000',
  'Urgent': '103391001',
  'Very urgent': '1356878002',
  'Emergency': '25876001',
}

export const PRIORITIES = keys(PRIORITY_SNOMED_CODES)

export type Priority = (typeof PRIORITIES)[number]
