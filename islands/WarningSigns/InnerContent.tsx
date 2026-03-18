import { computed, Signal, useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassCircleIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { AsyncSearchHookResult, SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import { uniqBy } from '../../util/uniqBy.ts'
import { FindingModal } from '../finding/Modal.tsx'
import Search from '../Search.tsx'
import { SelectedChips } from '../SelectedRecordChip.tsx'
import { WarningSignsHiddenInputs } from './HiddenInputs.tsx'
import { WarningSignsPriorityTable } from './PriorityTable.tsx'
import { CATEGORIES, CheckedWarningSign, FindingDetails, SelectedWarningSign, uniqueIdentifier } from './shared.ts'

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
        checked: true,
      }),
  )

  const active_modal_sign = useSignal<SelectedWarningSign | null>(null)

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => ({
      ...sign,
      checked: selected_signs.value.some((checked_sign) => uniqueIdentifier(checked_sign) === uniqueIdentifier(sign)),
    }))
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...table_signs_with_checked.value,
      ...selected_signs.value,
    ], uniqueIdentifier)
  )

  function onCheck(sign: CheckedWarningSign) {
    selected_signs.value = selected_signs.value = [
      ...selected_signs.value,
      { ...sign, checked: true },
    ]
    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
      return
    }
  }

  function onUncheck(sign: CheckedWarningSign) {
    assert(sign.checked)
    selected_signs.value = selected_signs.value.filter((checked_sign) => uniqueIdentifier(checked_sign) !== uniqueIdentifier(sign))
  }

  function onOpenDetails(sign: SelectedWarningSign) {
    active_modal_sign.value = sign
  }

  function onSaveDetails(sign: SelectedWarningSign, details: FindingDetails) {
    selected_signs.value = selected_signs.value.map((s) => uniqueIdentifier(s) === uniqueIdentifier(sign) ? { ...s, details } : s)
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
        finding={active_modal_sign.value}
        onSave={onSaveDetails}
        onClose={() => active_modal_sign.value = null}
      />
    </div>
  )
}
