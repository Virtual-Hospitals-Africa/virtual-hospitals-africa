import { FindingSiteWithMaybeRecords, Maybe, RecordedFinding, WarningSignWithMaybeRecord } from '../../types.ts'
import compact from '../../util/compact.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import memoize from '../../util/memoize.ts'
import { normalized } from '../FollowUps/follow_ups.ts'

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

export type CategoryConfig = { category: string; priority: CategoryPriority }
type CategoryPriority = typeof CATEGORIES[number]['priority']

/*
  With a finding site chosen its signs stand in for the warning signs, headed by the site's label.
  Search results still come first, as they do otherwise.
*/
export function tableCategories(finding_site: Maybe<FindingSiteWithMaybeRecords>): CategoryConfig[] {
  if (!finding_site) return CATEGORIES
  return [CATEGORIES[0], { category: finding_site.label, priority: null }]
}

export function signsToDisplay({ search_results, finding_site, warning_signs }: {
  search_results: Maybe<WarningSignWithMaybeRecord[]>
  finding_site: Maybe<FindingSiteWithMaybeRecords>
  warning_signs: WarningSignWithMaybeRecord[]
}): WarningSignWithMaybeRecord[] {
  return search_results || finding_site?.signs || warning_signs
}

export function searchRouteFor(search_route: string, finding_site: Maybe<FindingSiteWithMaybeRecords>): string {
  if (!finding_site) return search_route
  const params = new URLSearchParams({ finding_site: finding_site.snomed_concept.name })
  return `${search_route}${search_route.includes('?') ? '&' : '?'}${params}`
}

// A sign as the tables render it, with the recorded finding standing for it if any
export type SignWithRecorded = WarningSignWithMaybeRecord & { recorded?: RecordedFinding }

export type OnCheckSign = (sign: WarningSignWithMaybeRecord) => void
export type OnOpenSignDetails = (sign: WarningSignWithMaybeRecord, recorded: RecordedFinding) => void

export const uniqueIdentifier = memoize(
  function uniqueIdentifier({ key, category, name, description }: WarningSignWithMaybeRecord) {
    const latter = key ? [key] : compact([name, description])
    return hyphenate([category, ...latter].join('-').toLowerCase())
  },
)

export const sameSign = (sign1: WarningSignWithMaybeRecord, sign2: WarningSignWithMaybeRecord) => uniqueIdentifier(sign1) === uniqueIdentifier(sign2)

const normalizedSign = memoize(
  function normalizedSign(sign: WarningSignWithMaybeRecord) {
    return normalized(sign.clinical_finding_s_expression)
  },
)

/*
  The recorded finding standing for a sign, if any: one recorded under the sign's own key,
  one for the record the sign was rendered with (as a prior record is shared by a warning sign
  and a finding-site sign), or one entered as the very finding the sign names, as a follow up
  checked from the panel may be.
*/
export function findRecorded(recorded: RecordedFinding[], sign: WarningSignWithMaybeRecord): RecordedFinding | undefined {
  const key = uniqueIdentifier(sign)
  return recorded.find((candidate) =>
    candidate.key === key ||
    (!!sign.existing_record && candidate.record_id === sign.existing_record.id) ||
    normalized(candidate.entered.s_expression) === normalizedSign(sign)
  )
}

/*
  The sign a recorded finding was checked as, if it is one of the page's, for its modifiers
  when reopening the modal from a chip.
*/
export function signOf(signs: WarningSignWithMaybeRecord[], recorded: RecordedFinding): WarningSignWithMaybeRecord | undefined {
  return signs.find((sign) => findRecorded([recorded], sign))
}
