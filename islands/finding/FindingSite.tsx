import { useSignal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import AsyncSearch from '../AsyncSearch.tsx'
import { SnomedConceptAttribute } from '../../shared/s_expression_schemas.ts'
import { Maybe, RenderedSnomedConcept } from '../../types.ts'

const base_search_route = '/app/snomed/body-structure'

function SingularFindingSiteSearch({ initial_value, onChange }: {
  initial_value?: Maybe<RenderedSnomedConcept>
  onChange(body_structures: RenderedSnomedConcept[]): void
}) {
  const params = initial_value && new URLSearchParams({
    descendant_of_snomed_concept_name: initial_value.name,
    descendant_of_snomed_concept_category: initial_value.category,
  })

  return (
    <AsyncSearch<RenderedSnomedConcept>
      search_route={params ? `${base_search_route}?${params}` : base_search_route}
      value={initial_value}
      onSelect={(value) => onChange(value ? [value] : [])}
      placeholder='Search for a body structure...'
      skip_blank_search
    />
  )
}

function MultiFindingSiteSearch({ initial_value, onChange }: {
  initial_value: RenderedSnomedConcept[]
  onChange(body_structures: RenderedSnomedConcept[]): void
}) {
  // Prevents senting on change on first render
  const signal = useSignal<RenderedSnomedConcept[]>(initial_value)
  const mounted = useRef(false)
  useSignalEffect(() => {
    const value = signal.value
    if (mounted.current) return onChange(value)
    mounted.current = true
  })

  return (
    <AsyncSearch<RenderedSnomedConcept>
      multi
      search_route={base_search_route}
      signal={signal}
      placeholder='Search for a body structure...'
      skip_blank_search
    />
  )
}

export function FindingSite({
  search_within,
  value,
  onChange,
}: {
  search_within: Maybe<SnomedConceptAttribute>
  value: RenderedSnomedConcept[]
  onChange(body_structures: RenderedSnomedConcept[]): void
}) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold text-gray-900'>Finding Site</h3>
      {search_within
        ? <SingularFindingSiteSearch initial_value={value[0]} onChange={onChange} />
        : <MultiFindingSiteSearch initial_value={value} onChange={onChange} />}
    </div>
  )
}
