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

  const active_modal_sign = useSignal<SelectedWarningSign | null>(null)

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => ({
      ...sign,
      augmented: sign.existing_record?.augmented,
      checked: selected_signs.value.some((checked_sign) => uniqueIdentifier(checked_sign) === uniqueIdentifier(sign)),
    }))
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...selected_signs.value,
      ...table_signs_with_checked.value,
    ], uniqueIdentifier)
  )

  function onCheck(sign: CheckedWarningSign) {
    const selected_sign = { ...sign, checked: true as const }
    selected_signs.value = selected_signs.value = [
      ...selected_signs.value,
      selected_sign,
    ]
    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
    }
    active_modal_sign.value = selected_sign
  }

  function onUncheck(sign: CheckedWarningSign) {
    assert(sign.checked)
    selected_signs.value = selected_signs.value.filter((checked_sign) => uniqueIdentifier(checked_sign) !== uniqueIdentifier(sign))
  }

  function onOpenDetails(sign: SelectedWarningSign) {
    active_modal_sign.value = sign
  }

  function onSaveDetails(finding: ConfiguredFinding) {
    console.log({finding})
    selected_signs.value = selected_signs.value.map((s) =>
      uniqueIdentifier(s) === uniqueIdentifier(active_modal_sign.value!)
        ? {
          ...s,
          augmented: {
            s_expression: finding.s_expression,
            display: finding.display,
            priority: finding.priority,
          },
        }
        : s
    )
    active_modal_sign.value = null
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
        finding={asConfiguredFinding(active_modal_sign.value)}
        onSave={onSaveDetails}
        onClose={() => active_modal_sign.value = null}
      />
    </div>
  )
}

function asConfiguredFinding(sign: SelectedWarningSign | null): ConfiguredFinding | null {
  if (!sign) return null

  const sign_node = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)
  if (!sign.existing_record?.augmented) {
    return {
      node: sign_node,
      s_expression: sign.clinical_finding_s_expression,
      display: sign.name,
      priority: sign.priority,
      nonremovable_qualifiers: sign_node.qualifiers,
      predefined_attributes: sign.predefined_attributes,
      relevant_qualifiers: sign.relevant_qualifiers,
    }
  }

  const node = parseWithSchema(sign.clinical_finding_s_expression, insertable_finding_base)

  return {
    node,
    s_expression: sign.existing_record.augmented.s_expression,
    display: sign.existing_record.augmented.display,
    priority: sign.existing_record.augmented.priority || sign.priority,
    nonremovable_qualifiers: sign_node.qualifiers,
    predefined_attributes: sign.predefined_attributes,
    relevant_qualifiers: sign.relevant_qualifiers,
  }
}
