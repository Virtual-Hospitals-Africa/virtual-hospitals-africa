import { computed, Signal, useSignal } from '@preact/signals'
import { useMemo, useRef } from 'preact/hooks'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassIcon } from '../../components/library/icons/heroicons/mini.tsx'
import {
  AsyncSearchHookResult,
  EnteredFinding,
  FindingModalMetadata,
  FindingToCheckFor,
  SnomedWarningSignSearchResult,
  WarningSignWithMaybeRecord,
} from '../../types.ts'
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
import { ClinicalFindingPostBody } from '../../shared/clinical_finding_post.ts'
import { assert } from 'std/assert/assert.ts'
import debounce from '../../util/debounce.ts'
import { accumulateFollowUps, FollowUpGroup } from './follow_ups.ts'
import { FollowUpsPanel } from './FollowUpsPanel.tsx'

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
  post_route,
  findings_to_check_for_route,
  search_results,
  snomed_warning_signs_async_search,
  warning_signs,
}: {
  post_route: string // /app/organizations/[organization_id]/patients/[patient_id]/open_encounter/clinical_finding
  findings_to_check_for_route: string | null // .../open_encounter/findings_to_check_for, null skips prefetching (tutorial)
  search_results: Signal<null | WarningSignWithMaybeRecord[]>
  snomed_warning_signs_async_search: AsyncSearchHookResult<SnomedWarningSignSearchResult>
  warning_signs: WarningSignWithMaybeRecord[]
}) {
  const checked_signs = useSignal<CheckedWarningSign[]>(
    compactMap(warning_signs, (sign) =>
      sign.existing_record?.existence === 'Yes' && {
        ...sign,
        entered: sign.existing_record.augmented || asEntered(sign),
        saving: false,
      }),
  )

  const follow_ups_needed = useSignal<FollowUpGroup[]>([])

  // Dry-run results keyed by the exact s_expression, held as promises so a save
  // can await a request still in flight. Failed requests are evicted.
  const follow_ups_cache = useRef(new Map<string, Promise<FindingToCheckFor[]>>())
  // The first onChange from an opened modal fetches immediately, subsequent edits are debounced
  const modal_prefetched = useRef(false)

  function fetchFollowUps(s_expression: string): Promise<FindingToCheckFor[]> {
    if (!findings_to_check_for_route) return Promise.resolve([])
    const cached = follow_ups_cache.current.get(s_expression)
    if (cached) return cached

    const params = new URLSearchParams({ s_expression })
    const request = fetch(`${findings_to_check_for_route}?${params}`, { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`findings_to_check_for responded ${response.status}`)
        const json = await response.json()
        return json.findings_to_check_for as FindingToCheckFor[]
      })
      .catch((error) => {
        console.error(error)
        follow_ups_cache.current.delete(s_expression)
        return []
      })
    follow_ups_cache.current.set(s_expression, request)
    return request
  }

  const debounced_fetch_follow_ups = useMemo(() => debounce(fetchFollowUps, 220), [findings_to_check_for_route])

  function onModalChange(finding: EnteredFinding) {
    if (modal_prefetched.current) return debounced_fetch_follow_ups(finding.s_expression)
    modal_prefetched.current = true
    fetchFollowUps(finding.s_expression)
  }

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
      saving: false as const,
    }
    checked_signs.value = [
      ...checked_signs.value,
      checked_sign,
    ]
    modal_prefetched.current = false
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
    modal_prefetched.current = false
    active_modal.value = {
      sign,
      just_checked: false,
      metadata: asFindingModalMetadata(sign),
    }
  }

  function updateSigns(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const active_modal_sign = active_modal.value!.sign
    const isActiveSign = (sign: CheckedWarningSign) => sameSign(sign, active_modal_sign)

    if (finding === RemoveFindingSymbol) {
      checked_signs.value = checked_signs.value.filter(negate(isActiveSign))
      return
    }

    let edited: CheckedWarningSign
    checked_signs.value = checked_signs.value.map((sign) => {
      if (!isActiveSign(sign)) return sign
      assert(!edited)

      // TODO
      // if (sign.existing_record) {
      //   if (sign.existing_record.augmented.s_expression === finding.s_expression) {
      //     ...
      //   }
      // }

      const as_finding_id = crypto.randomUUID()
      const to_post: ClinicalFindingPostBody = {
        finding_id: as_finding_id,
        s_expression: finding.s_expression,
        priority_level: finding.priority,
        // TODO
        // entered_in_error_record_id
      }
      fetch(post_route, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(to_post),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`clinical_finding responded ${response.status}: ${await response.text()}`)
          const json = await response.json()
          assert(json.success)
          checked_signs.value = checked_signs.value.map((sign) => {
            if (!isActiveSign(sign)) return sign
            // TODO consider assert(sign.saving) ?
            if (!sign.saving) return sign
            if (sign.saving.as_finding_id !== as_finding_id) return sign
            return {
              ...sign,
              existing_record: {
                id: as_finding_id,
                existence: 'Yes' as const,
                augmented: finding,
              },
              saving: false,
            }
          })
        })
        .catch((error) => {
          // The sign stays entered so it is still submitted with the page, but is no longer marked as saving
          console.error(error)
          checked_signs.value = checked_signs.value.map((sign) => {
            if (!isActiveSign(sign) || !sign.saving || sign.saving.as_finding_id !== as_finding_id) return sign
            return { ...sign, saving: false }
          })
        })
      return edited = {
        ...sign,
        entered: finding,
        saving: { as_finding_id },
      }
    })
    assert(edited!)
  }

  function onSaveDetails(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const key = uniqueIdentifier(active_modal.value!.sign)
    updateSigns(finding)
    active_modal.value = null
    debounced_fetch_follow_ups.cancel()

    if (finding === RemoveFindingSymbol) {
      follow_ups_needed.value = accumulateFollowUps(follow_ups_needed.value, { key, due_to: null, findings_to_check_for: [] })
      return
    }

    // Usually already resolved having been prefetched while the modal was open
    fetchFollowUps(finding.s_expression).then((findings_to_check_for) => {
      follow_ups_needed.value = accumulateFollowUps(follow_ups_needed.value, { key, due_to: finding, findings_to_check_for })
    })
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
        onChange={onModalChange}
        onClose={() => active_modal.value = null}
      />
      <FollowUpsPanel
        groups={follow_ups_needed.value}
        onDismiss={() => follow_ups_needed.value = []}
      />
    </div>
  )
}
