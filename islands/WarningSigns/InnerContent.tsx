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
import { CATEGORIES, CheckedWarningSign, sameSign, SelectedWarningSign, uniqueIdentifier } from './shared.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { higherPriority } from '../../shared/priorities.ts'
import { RemoveFindingSymbol } from '../finding/RemoveFindingSymbol.tsx'
import negate from '../../util/negate.ts'
import memoize from '../../util/memoize.ts'

//
let parseSExpressionAsFinding = (s_expression: string) => parseWithSchema(s_expression, insertable_finding_base)
if (typeof window !== 'undefined') {
  parseSExpressionAsFinding = memoize(parseSExpressionAsFinding)
}

function asAugmented(sign: WarningSignWithMaybeRecord) {
  return {
    s_expression: sign.clinical_finding_s_expression,
    display: findingFullDisplay(parseSExpressionAsFinding(sign.clinical_finding_s_expression)),
    priority: sign.priority,
  }
}

// TODO when working on making a FindingsModal that's actually reusable we may want to make aspects of this logic more portable
function asConfiguredFinding({
  checked,
  augmented,
  clinical_finding_s_expression,
  priority,
  predefined_attributes,
  relevant_qualifiers,
}: SelectedWarningSign): ConfiguredFinding {
  assert(checked)
  assert(augmented)

  // TODO I don't necessarily love that the parser now is needed on the frontend, but I don't see a viable alternative
  const sign_node = parseSExpressionAsFinding(clinical_finding_s_expression)
  const node = parseSExpressionAsFinding(augmented.s_expression)

  // The sign's qualifers are inherent to the sign itself and thus nonremovable
  const inherent_qualifiers = sign_node.qualifiers
  const inherent_qualifiers_s_expressions = new Set(inherent_qualifiers.map(inverseSExpression))

  // The backend sends relevant_qualifiers that are in a sense redundant because they're inherent in the sign
  // We form the optional_relevant_qualifiers, which are those that are not inherent in the sign and thus can be included or not
  // As an example for Circumferential Burn, "Circumferential" is inherent but also sent as a relevant qualifier (because it would be relevant for a Burn)
  // We don't want the user removing "Circumferential" for that sign, so it is not optional
  // TODO Evaluate whether it's worth having the backend do this deduplication
  const optional_relevant_qualifiers = relevant_qualifiers.filter((relevant_qualifier) =>
    !inherent_qualifiers_s_expressions.has(relevant_qualifier.s_expression)
  )

  return {
    node,
    predefined_attributes,
    inherent_qualifiers,
    optional_relevant_qualifiers,
    s_expression: augmented.s_expression,
    display: augmented.display,
    original_priority: priority,
    augmented_priority: augmented.priority,
  }
}

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
        augmented: sign.existing_record.augmented || asAugmented(sign),
      }),
  )

  const active_modal = useSignal<
    null | {
      just_checked: boolean
      configured_finding: ConfiguredFinding
      sign: CheckedWarningSign
    }
  >(null)

  console.log('wekllwekkwe', search_results.value)

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => {
      const selected = selected_signs.value.find((checked_sign) => sameSign(checked_sign, sign))
      return selected || { ...sign, checked: false as const }
    })
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...selected_signs.value,
      ...table_signs_with_checked.value,
    ], uniqueIdentifier)
  )

  function onCheck(sign: CheckedWarningSign) {
    const selected_sign = {
      ...sign,
      checked: true as const,
      augmented: sign.augmented || asAugmented(sign),
    }
    selected_signs.value = selected_signs.value = [
      ...selected_signs.value,
      selected_sign,
    ]
    active_modal.value = {
      sign,
      just_checked: true,
      configured_finding: asConfiguredFinding(selected_sign),
    }

    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
    }
  }

  function onUncheck(sign: CheckedWarningSign) {
    assert(sign.checked)
    selected_signs.value = selected_signs.value.filter((checked_sign) => !sameSign(checked_sign, sign))
  }

  function onOpenDetails(sign: SelectedWarningSign) {
    active_modal.value = {
      sign,
      just_checked: false,
      configured_finding: asConfiguredFinding(sign),
    }
  }

  function updatedSigns(finding: ConfiguredFinding | typeof RemoveFindingSymbol) {
    const isActiveSign = (sign: SelectedWarningSign) => sameSign(sign, active_modal.value!.sign)

    if (finding === RemoveFindingSymbol) {
      return selected_signs.value.filter(negate(isActiveSign))
    }

    const { s_expression, display, augmented_priority, original_priority } = finding
    const priority = higherPriority(augmented_priority, original_priority)
    const augmented = { s_expression, display, priority }
    return selected_signs.value.map((s) => isActiveSign(s) ? { ...s, augmented } : s)
  }

  function onSaveDetails(finding: ConfiguredFinding | typeof RemoveFindingSymbol) {
    selected_signs.value = updatedSigns(finding)
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
          loading_options={snomed_warning_signs_async_search.loading}
          do_not_render_built_in_options
          is_async
        />
        <SelectedChips
          id='warning-signs-selected-chips'
          items={selected_signs.value}
          onEdit={onOpenDetails}
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
        just_checked={active_modal.value?.just_checked || false}
        onSave={onSaveDetails}
        onClose={() => active_modal.value = null}
      />
    </div>
  )
}
