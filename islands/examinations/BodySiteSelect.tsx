import { assert } from 'std/assert/assert.ts'
import AsyncSearch from '../../islands/AsyncSearch.tsx'
import type { ExaminationChecklistDefinition } from '../../types.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'
import type { SnomedConceptResult } from '../../routes/app/snomed/concepts.ts'

export function BodySiteSelect({ checklist_item, value, onSelect }: {
  checklist_item: ExaminationChecklistDefinition
  value: SnomedConceptResult | null
  onSelect(
    value: {
      id: string
      name: string
    },
  ): void
}) {
  console.log('BodySiteSelect value', value)
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
        assert(typeof value.id === 'string')
        assertHasNonEmptyString(value, 'snomed_english_term')
        onSelect(value)
      }}
    />
  )
}
