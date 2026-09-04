import { DialogTitle } from '@headlessui/react'
import { useSignal } from '@preact/signals'
import { Button } from '../../components/library/Button.tsx'
import { PaperAirplaneIcon, XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { ConfiguredFinding, Maybe, RenderedSnomedConcept } from '../../types.ts'
import { FindingSite } from './FindingSite.tsx'
import { PainLevelSelect } from './PainLevel.tsx'
import { QualifierSearch } from './QualifierSearch.tsx'
import { ATTRIBUTE, EVENT, FINDING_SITE, PAIN_LEVEL, RESOLVED, TIME_OF_ONSET } from '../../shared/snomed_concepts.ts'
import { attribute, Lang, SnomedConceptAttribute } from '../../shared/s_expression_schemas.ts'
import { assert } from 'std/assert/assert.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { OnsetRow } from './Onset.tsx'
import compact from '../../util/compact.ts'
import { PAIN_LEVELS, PainLevel } from '../../shared/pain_levels.ts'
import { exists } from '../../util/exists.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { RemoveFindingSymbol } from './RemoveFindingSymbol.tsx'

function isFindingSite(attribute: Lang['attribute']): attribute is SnomedConceptAttribute {
  return attribute.specific_snomed_concept.name === FINDING_SITE.name
}

function isPainLevel(attribute: Lang['attribute']): attribute is SnomedConceptAttribute {
  return attribute.specific_snomed_concept.name === PAIN_LEVEL.name
}

export function FindingModalContents(
  { finding, just_checked, onSave, onClose }: {
    finding: ConfiguredFinding
    just_checked: boolean
    onSave(finding: ConfiguredFinding | typeof RemoveFindingSymbol): void
    onClose(): void
  },
) {
  const predefined_attributes = finding.predefined_attributes.map(({ s_expression }) => parseWithSchema(s_expression, attribute))
  const search_within_finding_site = predefined_attributes.find(isFindingSite)

  const dates = useSignal<{ onset: string; resolved: string | null } | null>(null)
  let initial_finding_sites = finding.node.attributes.filter(isFindingSite)
  if (!initial_finding_sites.length && search_within_finding_site) {
    initial_finding_sites = [search_within_finding_site]
  }
  const finding_sites = useSignal<RenderedSnomedConcept[]>(initial_finding_sites.map((s) => {
    assert(s.value.atom === 'snomed_concept')
    return { id: '@@triggersearch', snomed_concept_id: '@@triggersearch', ...s.value }
  }))

  const pain_level_attribute = finding.node.attributes.find(isPainLevel)?.value

  const pain_level = useSignal<Maybe<PainLevel>>(
    pain_level_attribute && exists(PAIN_LEVELS.find((pain_level) => pain_level.concept.name === pain_level_attribute.name)),
  )

  const inherent_qualifiers = new Set(finding.inherent_qualifiers.map((q) => inverseSExpression(q)))
  const removable_qualifiers = finding.node.qualifiers.filter((qualifier) => !inherent_qualifiers.has(inverseSExpression(qualifier)))
  const qualifiers = useSignal<RenderedSnomedConcept[]>(removable_qualifiers.map((q) => ({
    id: '@@triggersearch',
    snomed_concept_id: '@@triggersearch',
    name: q.specific_snomed_concept.name,
    category: q.specific_snomed_concept.category,
  })))

  function handleSave() {
    const new_finding_sites = finding_sites.value.filter((finding_site) => {
      assert(finding_site.category === 'body structure')
      const identical_finding_site_already_predefined = !!search_within_finding_site && finding_site.name === search_within_finding_site.value.name
      return !identical_finding_site_already_predefined
    })

    const new_node = {
      ...finding.node,
      qualifiers: [
        ...finding.inherent_qualifiers,
        ...qualifiers.value.map((qualifier) => ({
          atom: 'qualifier' as const,
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: qualifier.name,
            category: qualifier.category,
          },
          qualifiers: [],
        })),
      ],
      attributes: compact([
        dates.value && {
          atom: 'attribute' as const,
          root_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: EVENT.name,
            category: EVENT.category,
          },
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: TIME_OF_ONSET.name,
            category: TIME_OF_ONSET.category,
          },
          value: {
            atom: 'event' as const,
            datetime: dates.value.onset,
            location: null,
          },
        },
        dates.value?.resolved && {
          atom: 'attribute' as const,
          root_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: EVENT.name,
            category: EVENT.category,
          },
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: RESOLVED.name,
            category: RESOLVED.category,
          },
          value: {
            atom: 'event' as const,
            datetime: dates.value.resolved,
            location: null,
          },
        },
        pain_level.value && {
          atom: 'attribute' as const,
          root_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: ATTRIBUTE.name,
            category: ATTRIBUTE.category,
          },
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: PAIN_LEVEL.name,
            category: PAIN_LEVEL.category,
          },
          value: {
            atom: 'snomed_concept' as const,
            name: pain_level.value.concept.name,
            category: pain_level.value.concept.category,
          },
        },
        ...new_finding_sites.map((site) => ({
          atom: 'attribute' as const,
          root_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: ATTRIBUTE.name,
            category: ATTRIBUTE.category,
          },
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: FINDING_SITE.name,
            category: FINDING_SITE.category,
          },
          value: {
            atom: 'snomed_concept' as const,
            name: site.name,
            category: site.category,
          },
        })),
      ]),
    }

    onSave({
      ...finding,
      node: new_node,
      s_expression: inverseSExpression(new_node),
      display: findingFullDisplay(new_node),
      augmented_priority: pain_level.value?.priority,
    })
  }

  return (
    <div className='flex flex-col max-h-[90vh]'>
      {/* Header */}
      <div className='relative px-6 pt-8 pb-4 text-center'>
        <button
          type='button'
          className='absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          onClick={handleSave}
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
        <DialogTitle className='text-xl font-bold text-gray-900'>
          {finding.display}
        </DialogTitle>
      </div>
      <div className='overflow-y-auto flex-1 px-6 pb-4 flex flex-col gap-5'>
        <OnsetRow
          onChange={(value) => dates.value = value}
        />
        <PainLevelSelect
          value={pain_level.value}
          onChange={(value) => pain_level.value = value}
        />
        <QualifierSearch
          signal={qualifiers}
          optional_relevant_qualifiers={finding.optional_relevant_qualifiers}
        />
        <FindingSite
          search_within={search_within_finding_site}
          value={finding_sites.value}
          onChange={(value) => finding_sites.value = value}
        />
      </div>

      {/* Footer */}
      <div className='flex gap-3 border-t border-gray-100 px-6 py-4'>
        <Button
          variant={just_checked ? 'tertiary' : 'semidestructive'}
          className='flex-1'
          type='button'
          onClick={() => {
            onSave(RemoveFindingSymbol)
            onClose()
          }}
        >
          {just_checked ? 'Cancel' : 'Remove'}
        </Button>
        <Button
          variant='primary'
          className='flex-1'
          type='button'
          onClick={handleSave}
          left_icon={<PaperAirplaneIcon className='h-4 w-4' />}
        >
          Save to Record
        </Button>
      </div>
    </div>
  )
}
