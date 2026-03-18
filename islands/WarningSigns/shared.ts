import { WarningSignWithMaybeRecord } from '../../types.ts'
import compact from '../../util/compact.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import memoize from '../../util/memoize.ts'

export const CATEGORIES = [
  {
    category: 'Search Results' as const,
    priority: null,
  },
  {
    category: 'Emergency' as const,
    priority: 'Emergency' as const,
  },
  {
    category: 'Very urgent' as const,
    priority: 'Very urgent' as const,
  },
  {
    category: 'Urgent' as const,
    priority: 'Urgent' as const,
  },
  {
    category: 'Common Symptoms' as const,
    priority: null,
  },
]

export const EMERGENCY_SUBCATEGORY_ORDER = [
  'Airway & Breathing',
  'Circulation',
  'Convulsions/Coma',
  'Dehydration',
  'Other',
] as const

export type CategoryConfig = typeof CATEGORIES[number]

export type FindingDetails = {
  refined_concept?: string
  attributes?: Record<string, string[]>
  qualifier?: string
}

export type CheckedWarningSign = WarningSignWithMaybeRecord & {
  checked: boolean
  details?: FindingDetails
}

export type SelectedWarningSign = CheckedWarningSign & { checked: true }

export type OnToggle = (sign: CheckedWarningSign) => void

export const uniqueIdentifier = memoize(
  function uniqueIdentifier({ key, category, name, description }: WarningSignWithMaybeRecord) {
    const latter = key ? [key] : compact([name, description])
    return hyphenate([category, ...latter].join('-').toLowerCase())
  },
)
