import { Signal } from '@preact/signals'
import AsyncSearch from '../AsyncSearch.tsx'
import { RenderedSnomedConcept } from '../../types.ts'
import { Button } from '../../components/library/Button.tsx'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { qualifier } from '../../shared/s_expression_schemas.ts'
import compactMap from '../../util/compactMap.ts'

const base_search_route = '/app/snomed/qualifier-value'

export function QualifierSearch({
  signal,
  relevant_qualifiers,
}: {
  signal: Signal<RenderedSnomedConcept[]>
  relevant_qualifiers: {
    s_expression: string
  }[]
}) {
  const add_relevant_qualifiers = compactMap(relevant_qualifiers, ({ s_expression }) => {
    const relevant_qualifier = parseWithSchema(s_expression, qualifier)

    // TODO wouldn't work in case of nested qualifiers
    const matches = (q: RenderedSnomedConcept) =>
      q.name === relevant_qualifier.specific_snomed_concept.name &&
      q.category === relevant_qualifier.specific_snomed_concept.category

    const added = signal.value.some(matches)
    if (added) return null
    return (
      <Button
        variant='ghostlink'
        type='button'
        onClick={() => {
          signal.value = [...signal.value, {
            snomed_concept_id: '@@triggersearch',
            name: relevant_qualifier.specific_snomed_concept.name,
            category: relevant_qualifier.specific_snomed_concept.category,
          }]
        }}
      >
        + Add {relevant_qualifier.specific_snomed_concept.name}
      </Button>
    )
  })

  return (
    <div className='flex flex-col'>
      <h3 className='text-sm font-semibold text-gray-900 mb-2'>Qualifiers</h3>
      <AsyncSearch<RenderedSnomedConcept>
        multi
        search_route={base_search_route}
        signal={signal}
        placeholder='Search for a qualifier...'
        skip_blank_search
      />
      <div title='relevant qualifiers' id='relevant-qualifiers' class='flex flex-row gap-2'>
        {add_relevant_qualifiers}
        {!add_relevant_qualifiers.length && !!relevant_qualifiers.length && (
          <Button
            variant='ghostlink'
            type='button'
            className='opacity-0 pointer-events-none'
            tabIndex={-1}
            aria-hidden
          >
            + Add
          </Button>
        )}
      </div>
    </div>
  )
}
