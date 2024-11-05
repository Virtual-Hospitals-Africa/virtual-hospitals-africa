import AsyncSearch from '../../islands/AsyncSearch.tsx'
import type { ChecklistItem } from './ChecklistItem.tsx'
import { assertHasNonEmptyString } from '../../util/isString.ts'

export function BodySiteSelect({ checklist_item, value, onSelect }: {
  checklist_item: ChecklistItem
  value: { id: string; name: string } | null
  onSelect(value: { id: string; name: string }): void
}) {
  return (
    <AsyncSearch
      label='Body site'
      required
      search_route={`/app/snomed/body_structures?parent_codes=${
        checklist_item.body_sites.map((s) => s.code).join(
          ',',
        )
      }`}
      value={value}
      onSelect={(value) => {
        assertHasNonEmptyString(value, 'id')
        assertHasNonEmptyString(value, 'name')
        onSelect(value)
      }}
    />
  )
}
