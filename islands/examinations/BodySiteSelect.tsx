import { assert } from 'std/assert/assert.ts'
import AsyncSearch from '../../islands/AsyncSearch.tsx'
import type { ExaminationChecklistDefinition } from '../../types.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'

export function BodySiteSelect({ checklist_item, value, onSelect }: {
  checklist_item: ExaminationChecklistDefinition
  value: { snomed_concept_id: number; name: string } | null
  onSelect(value: { snomed_concept_id: number; name: string }): void
}) {
  return (
    <AsyncSearch
      label='Body site'
      required
      search_route={`/app/snomed/concepts?parent_codes=${
        checklist_item.body_sites.map((s) => s.snomed_concept_id).join(
          ',',
        )
      }`}
      value={value}
      name='body_site'
      onSelect={(value) => {
        if (!value) return
        assert(typeof value.snomed_concept_id === 'number')
        assertHasNonEmptyString(value, 'name')
        onSelect(value)
      }}
    />
  )
}
