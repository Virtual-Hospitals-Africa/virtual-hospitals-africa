import { computed, Signal, useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { AsyncSearchHookResult, ConfiguredFinding, SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import { uniqBy } from '../../util/uniqBy.ts'
import { FindingModal } from '../finding/Modal.tsx'
import Search from '../Search.tsx'
import { SelectedChips } from '../SelectedRecordChip.tsx'
import { WarningSignsHiddenInputs } from './HiddenInputs.tsx'
import { WarningSignsPriorityTable } from './PriorityTable.tsx'
import { CATEGORIES, CheckedWarningSign, SelectedWarningSign, uniqueIdentifier } from './shared.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { higherPriority } from '../../shared/priorities.ts'

export default function WarningSignsInnerContent({
  search_results,
  snomed_warning_signs_async_search,
  warning_signs,
}: {
  search_results: Signal<null | WarningSignWithMaybeRecord[]>
  snomed_warning_signs_async_search: AsyncSearchHookResult<SnomedWarningSignSearchResult>
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const selected_signs = useSignal<SelectedWarningSign[]>(
    compactMap(warning_signs, (sign) =>
      sign.existing_record?.existence === 'Yes' && {
        ...sign,
        augmented: sign.existing_record.augmented,
        checked: true,
      }),
  )

  const active_modal = useSignal<
    null | {
      configured_finding: ConfiguredFinding
      sign: CheckedWarningSign
    }
  >(null)

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => {
      const selected = selected_signs.value.find((checked_sign) => uniqueIdentifier(checked_sign) === uniqueIdentifier(sign))
      return selected || { ...sign, checked: false }
    })
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))
  console.log({ grouped })

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...selected_signs.value,
      ...table_signs_with_checked.value,
    ], uniqueIdentifier)
  )

  function onCheck(sign: CheckedWarningSign) {
    active_modal.value = { sign, configured_finding: asConfiguredFinding(sign) }
    const selected_sign = {
      ...sign,
      checked: true as const,
      augmented: {
        s_expression: active_modal.value.configured_finding.s_expression,
        display: active_modal.value.configured_finding.display,
        priority: higherPriority(
          active_modal.value.configured_finding.augmented_priority,
          active_modal.value.configured_finding.original_priority,
        ),
      },
    }
    selected_signs.value = selected_signs.value = [
      ...selected_signs.value,
      selected_sign,
    ]
    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
    }
  }

  function onUncheck(sign: CheckedWarningSign) {
    assert(sign.checked)
    selected_signs.value = selected_signs.value.filter((checked_sign) => uniqueIdentifier(checked_sign) !== uniqueIdentifier(sign))
  }

  function onOpenDetails(sign: SelectedWarningSign) {
    console.log('onOpenDetails', { sign })
    active_modal.value = {
      sign,
      configured_finding: asConfiguredFinding(sign),
    }
  }

  function onSaveDetails(finding: ConfiguredFinding) {
    console.log('onSaveDetails', { finding })
    selected_signs.value = selected_signs.value.map((s) =>
      uniqueIdentifier(s) === uniqueIdentifier(active_modal.value!.sign)
        ? {
          ...s,
          augmented: {
            s_expression: finding.s_expression,
            display: finding.display,
            priority: higherPriority(
              finding.augmented_priority,
              finding.original_priority,
            ),
          },
        }
        : s
    )
    active_modal.value = null
  }

  return (
    <div className='flex flex-col gap-1.25 2xl:gap-4 w-full' id='warning-signs'>
      <div className='sticky top-0 z-10 bg-white flex flex-col gap-1 pb-1'>
        <Search
          id='warning-signs-search'
          placeholder='Chief complaint'
          data-searchroute={snomed_warning_signs_async_search.search_route}
          options={snomed_warning_signs_async_search.results}
          onQuery={snomed_warning_signs_async_search.setQuery}
          do_not_render_built_in_options
          is_async
        />
        <SelectedChips
          id='warning-signs-selected-chips'
          items={selected_signs.value}
          onUncheck={onUncheck}
        />
      </div>
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassCircleIcon className='h-5 w-5' />}
        />
      )}
      {CATEGORIES.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onUncheck={onUncheck}
          onOpenDetails={onOpenDetails}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
      <WarningSignsHiddenInputs
        signs_to_send_to_server={signs_to_send_to_server.value}
      />
      <FindingModal
        finding={active_modal.value?.configured_finding ?? null}
        onSave={onSaveDetails}
        onClose={() => active_modal.value = null}
      />
    </div>
  )
}

function asConfiguredFinding(sign: CheckedWarningSign): ConfiguredFinding {
  console.log({ sign })
  // TODO I don't necessarily love that the parser now is needed on  the frontend, but I don't see a viable alternative
  const sign_node = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
  const nonremovable_qualifiers = sign_node.qualifiers

  const relevant_qualifiers = sign.relevant_qualifiers.filter((relevant_qualifier) =>
    !nonremovable_qualifiers.some((nonremovable_qualifier) => inverseSExpression(nonremovable_qualifier) === relevant_qualifier.s_expression)
  )

  if (!sign.augmented) {
    return {
      node: sign_node,
      s_expression: sign.clinical_finding_s_expression,
      display: findingFullDisplay(sign_node),
      original_priority: sign.priority,
      augmented_priority: sign.priority,
      nonremovable_qualifiers,
      predefined_attributes: sign.predefined_attributes,
      relevant_qualifiers,
    }
  }

  const node = parseWithSchema(sign.augmented.s_expression, insertable_finding_base)

  return {
    node,
    s_expression: sign.augmented.s_expression,
    display: sign.augmented.display,
    original_priority: sign.priority,
    augmented_priority: sign.augmented.priority,
    nonremovable_qualifiers,
    predefined_attributes: sign.predefined_attributes,
    relevant_qualifiers,
  }
}
