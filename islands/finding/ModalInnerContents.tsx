import { useSignal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import { AugmentedSign, BySExpressionResult, Maybe, NonEmptyArray, RenderedSnomedConcept, SnomedConcept } from '../../types.ts'
import { FindingSite } from './FindingSite.tsx'
import { PainLevel } from './PainLevel.tsx'
import { QualifierSearch } from './QualifierSearch.tsx'
import { groupBy } from '../../util/groupBy.ts'
import { ATTRIBUTE, EVENT, FINDING_SITE, PAIN_LEVEL, RESOLVED, TIME_OF_ONSET } from '../../shared/snomed_concepts.ts'
import { PAIN_LEVELS } from '../../shared/pain_levels.ts'
import { Lang, SnomedConceptAttribute } from '../../shared/s_expression_schemas.ts'
import { assert } from 'std/assert/assert.ts'
import { findingToDisplayableRecord, formatRecord } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { OnsetRow } from './Onset.tsx'
import { CheckboxGrid, CheckboxGridItem } from '../form/inputs/checkbox_grid.tsx'

function groupAttributes(attributes: Lang['attribute'][]) {
  return groupBy(attributes, (attr) => attr.specific_snomed_concept.name)
}

function isSnomedConceptAttribute(attr: Lang['attribute']): attr is SnomedConceptAttribute {
  return attr.value.atom === 'snomed_concept'
}

function getPredefinedFindingSite(attributes_map: Map<string, NonEmptyArray<Lang['attribute']>>): Maybe<SnomedConceptAttribute> {
  const finding_site = attributes_map.get(FINDING_SITE.name)?.[0]
  if (!finding_site) return
  assert(isSnomedConceptAttribute(finding_site))
  return finding_site
}

function getPainLevel(attributes_map: Map<string, NonEmptyArray<Lang['attribute']>>): Maybe<SnomedConcept> {
  const pain_level = attributes_map.get(PAIN_LEVEL.name)?.[0]
  if (!pain_level) return
  assert(isSnomedConceptAttribute(pain_level))
  return PAIN_LEVELS.find(({ concept }) => concept.name === pain_level.value.name)?.concept
}

export function FindingModalInnerContents({
  original_node,
  augmented_node,
  onChange,
}: {
  original_node: BySExpressionResult
  augmented_node: Maybe<BySExpressionResult>
  onChange(augmented: Maybe<AugmentedSign>): void
}) {
  const all_original_attributes = groupAttributes([
    ...original_node.attributes,
    ...original_node.predefined_attributes,
  ])
  const search_within_finding_site = getPredefinedFindingSite(all_original_attributes)
  const all_augmented_attributes = augmented_node ? groupAttributes(augmented_node.attributes) : new Map<string, NonEmptyArray<Lang['attribute']>>()

  const dates = useSignal<{ onset: string; resolved: string | null } | null>(null)
  let initial_finding_sites = all_augmented_attributes.get(FINDING_SITE.name) || []
  if (!initial_finding_sites.length && search_within_finding_site) {
    initial_finding_sites = [search_within_finding_site]
  }
  const finding_sites = useSignal<RenderedSnomedConcept[]>(initial_finding_sites.map((s) => {
    assert(s.value.atom === 'snomed_concept')
    return { id: '@@triggersearch', snomed_concept_id: '@@triggersearch', ...s.value }
  }))

  const pain_level = useSignal<Maybe<SnomedConcept>>(
    getPainLevel(all_augmented_attributes) || getPainLevel(all_original_attributes),
  )

  const initial_qualifiers = augmented_node?.qualifiers ?? []
  const qualifiers = useSignal<RenderedSnomedConcept[]>(initial_qualifiers.map((q) => ({
    id: '@@triggersearch',
    snomed_concept_id: '@@triggersearch',
    name: q.specific_snomed_concept.name,
    category: q.specific_snomed_concept.category,
  })))

  const mounted = useRef(false)
  useSignalEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    runOnChange()
  })

  function runOnChange() {
    /* We have the original_node & original attributes
    // Focusing just on finding site for now, if we
      1. selected finding sites where there were none previously, form a new augmented node with those as attributes
      1. selected finding sites but it's the same as the original node
        a. if predefined, omit
        b. if not predefined include
      2. no finding sites, ignore
    */

    const new_node = structuredClone(original_node)
    let any_updates = false

    const new_finding_sites = finding_sites.value.filter((finding_site) => {
      assert(finding_site.category === 'body structure')
      const identical_finding_site_already_existed = (all_original_attributes.get(FINDING_SITE.name) || []).some((attribute) => {
        assert(attribute.value.atom === 'snomed_concept')
        return attribute.value.name === finding_site.name
      })
      return !identical_finding_site_already_existed
    })

    const pain_level_already_existed = (all_original_attributes.get(PAIN_LEVEL.name) || []).some((attribute) => {
      assert(attribute.value.atom === 'snomed_concept')
      return attribute.value.name === pain_level.value?.name
    })

    if (pain_level.value && !pain_level_already_existed) {
      any_updates = true
      new_node.attributes.push({
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
          name: pain_level.value.name,
          category: pain_level.value.category,
        },
      })
    }

    if (qualifiers.value.length) {
      any_updates = true
      for (const qualifier of qualifiers.value) {
        new_node.qualifiers.push({
          atom: 'qualifier' as const,
          specific_snomed_concept: {
            atom: 'snomed_concept' as const,
            name: qualifier.name,
            category: qualifier.category,
          },
          qualifiers: [],
        })
      }
    }

    for (const site of new_finding_sites) {
      any_updates = true
      new_node.attributes.push({
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
      })
    }

    if (dates.value) {
      any_updates = true
      new_node.attributes.push({
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
      })
      if (dates.value.resolved) {
        new_node.attributes.push({
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
        })
      }
    }

    if (!any_updates) {
      return onChange(null)
    }

    const s_expression = inverseSExpression(new_node)
    const full_display = formatRecord(findingToDisplayableRecord(new_node)).displays.full
    onChange({
      s_expression,
      full_display,
    })
  }

  return (
    <>
      <div className='overflow-y-auto flex-1 px-6 pb-4 flex flex-col gap-5'>
        <OnsetRow
          onChange={(value) => {
            dates.value = value
            runOnChange()
          }}
        />
        <PainLevel
          value={pain_level.value}
          onChange={(value) => {
            pain_level.value = value
            runOnChange()
          }}
        />
        <QualifierSearch signal={qualifiers} />
        {!!original_node.relevant_qualifiers.length && (
          <CheckboxGrid title='relevant qualifiers' id='relevant-qualifiers'>
            {original_node.relevant_qualifiers.map((relevant_qualifier) => {
              const matches = (q: RenderedSnomedConcept) =>
                q.name === relevant_qualifier.specific_snomed_concept.name &&
                q.category === relevant_qualifier.specific_snomed_concept.category
              return (
                <CheckboxGridItem
                  label={relevant_qualifier.specific_snomed_concept.name}
                  checked={qualifiers.value.some(matches)}
                  onChange={(checked) => {
                    if (checked) {
                      if (!qualifiers.value.some(matches)) {
                        qualifiers.value = [...qualifiers.value, {
                          snomed_concept_id: '@@triggersearch',
                          name: relevant_qualifier.specific_snomed_concept.name,
                          category: relevant_qualifier.specific_snomed_concept.category,
                        }]
                      }
                    } else {
                      qualifiers.value = qualifiers.value.filter((q) => !matches(q))
                    }
                  }}
                />
              )
            })}
          </CheckboxGrid>
        )}
        <FindingSite
          search_within={search_within_finding_site}
          value={finding_sites.value}
          // value={null}
          onChange={(value) => {
            finding_sites.value = value
            runOnChange()
          }}
        />
      </div>
    </>
  )
}
