import { EnteredFinding, FindingSiteWithMaybeRecords, Maybe, WarningSignWithMaybeRecord } from '../../types.ts'
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
  // The sites the patient does not mean by this one, as JSON because a structure's name can contain a comma
  if (finding_site.excluding_structures.length) {
    params.set('excluding_structures', JSON.stringify(finding_site.excluding_structures))
  }
  // Other ways a finding can belong to this site, as s_expressions the server evaluates against each concept
  if (finding_site.including_s_expressions?.length) {
    params.set('including_s_expressions', JSON.stringify(finding_site.including_s_expressions))
  }
  return `${search_route}${search_route.includes('?') ? '&' : '?'}${params}`
}

export type CheckedWarningSign = WarningSignWithMaybeRecord & { entered: EnteredFinding; saving: false | { as_finding_id: string } }
export type UncheckedWarningSign = WarningSignWithMaybeRecord & { entered?: never }

export type ToggleableWarningSign = CheckedWarningSign | UncheckedWarningSign

export type OnToggle = (sign: ToggleableWarningSign) => void

export const uniqueIdentifier = memoize(
  function uniqueIdentifier({ key, category, name, description }: WarningSignWithMaybeRecord) {
    const latter = key ? [key] : compact([name, description])
    return hyphenate([category, ...latter].join('-').toLowerCase())
  },
)

export const sameSign = (sign1: WarningSignWithMaybeRecord, sign2: WarningSignWithMaybeRecord) => uniqueIdentifier(sign1) === uniqueIdentifier(sign2)

/*
  A sign is checked when it is itself among the checked signs, or when a checked sign of
  another category stands for the record it has, as a prior record does for a finding-site sign.
*/
export function findChecked(checked_signs: CheckedWarningSign[], sign: WarningSignWithMaybeRecord): CheckedWarningSign | undefined {
  return checked_signs.find((checked) => sameSign(checked, sign) || (!!sign.existing_record && checked.existing_record?.id === sign.existing_record.id))
}
