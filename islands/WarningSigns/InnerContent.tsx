import { computed, Signal, useSignal } from '@preact/signals'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { AsyncSearchHookResult, EnteredFinding, FindingModalMetadata, SnomedWarningSignSearchResult, WarningSignWithMaybeRecord } from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import { uniqBy } from '../../util/uniqBy.ts'
import { FindingModal } from '../finding/Modal.tsx'
import Search from '../Search.tsx'
import { SelectedChips } from '../SelectedRecordChip.tsx'
import { WarningSignsHiddenInputs } from './HiddenInputs.tsx'
import { WarningSignsPriorityTable } from './PriorityTable.tsx'
import { CATEGORIES, CheckedWarningSign, sameSign, ToggleableWarningSign, uniqueIdentifier } from './shared.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { RemoveFindingSymbol } from '../finding/RemoveFindingSymbol.tsx'
import negate from '../../util/negate.ts'

function asEntered({ priority, clinical_finding_s_expression: s_expression }: WarningSignWithMaybeRecord) {
  const display = findingFullDisplay(parseSExpressionAsInsertableFinding(s_expression))
  return { s_expression, priority, display }
}

// TODO we technically only need this on-demand when launching the modal, hence calling it as such
// Could be memoized
// TODO when working on making a FindingsModal that's actually reusable we may want to make aspects of this logic more portable
function asFindingModalMetadata({
  priority,
  relevant_qualifiers,
  predefined_attributes,
  clinical_finding_s_expression,
  onset_required,
}: WarningSignWithMaybeRecord): FindingModalMetadata {
  const sign_node = parseSExpressionAsInsertableFinding(clinical_finding_s_expression)

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
    priority,
    predefined_attributes,
    inherent_qualifiers,
    optional_relevant_qualifiers,
    onset_required,
    display: findingFullDisplay(sign_node),
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
  const checked_signs = useSignal<CheckedWarningSign[]>(
    compactMap(warning_signs, (sign) =>
      sign.existing_record?.existence === 'Yes' && {
        ...sign,
        entered: sign.existing_record.augmented || asEntered(sign),
      }),
  )

  const table_signs_to_display = computed(() => search_results.value || warning_signs)

  const table_signs_with_checked = computed(() =>
    table_signs_to_display.value.map((sign) => {
      const checked = checked_signs.value.find((checked_sign) => sameSign(checked_sign, sign))
      return checked || sign
    })
  )

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))

  const signs_to_send_to_server = computed(() =>
    uniqBy([
      ...checked_signs.value,
      ...table_signs_with_checked.value,
    ], uniqueIdentifier)
  )

  const active_modal = useSignal<
    null | {
      metadata: FindingModalMetadata
      sign: CheckedWarningSign
      just_checked: boolean
    }
  >(null)

  function onCheck(sign: ToggleableWarningSign) {
    const checked_sign = {
      ...sign,
      entered: sign.entered || asEntered(sign),
    }
    checked_signs.value = [
      ...checked_signs.value,
      checked_sign,
    ]
    active_modal.value = {
      just_checked: true,
      sign: checked_sign,
      metadata: asFindingModalMetadata(sign),
    }

    if (search_results.value) {
      search_results.value = null
      snomed_warning_signs_async_search.setQuery('')
    }
  }

  function onOpenDetails(sign: CheckedWarningSign) {
    active_modal.value = {
      sign,
      just_checked: false,
      metadata: asFindingModalMetadata(sign),
    }
  }

  function updatedSigns(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const isActiveSign = (sign: CheckedWarningSign) => sameSign(sign, active_modal.value!.sign)

    if (finding === RemoveFindingSymbol) {
      return checked_signs.value.filter(negate(isActiveSign))
    }

    return checked_signs.value.map((s) => isActiveSign(s) ? { ...s, entered: finding } : s)
  }

  function onSaveDetails(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    checked_signs.value = updatedSigns(finding)
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
          items={checked_signs.value}
          onEdit={onOpenDetails}
        />
      </div>
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassIcon className='h-5 w-5' />}
        />
      )}
      {CATEGORIES.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onOpenDetails={onOpenDetails}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
      <WarningSignsHiddenInputs
        signs_to_send_to_server={signs_to_send_to_server.value}
      />
      <FindingModal
        finding={active_modal.value && {
          metadata: active_modal.value.metadata,
          just_checked: active_modal.value.just_checked,
          entered: active_modal.value.sign.entered,
        }}
        onSave={onSaveDetails}
        onClose={() => active_modal.value = null}
      />
    </div>
  )
}
