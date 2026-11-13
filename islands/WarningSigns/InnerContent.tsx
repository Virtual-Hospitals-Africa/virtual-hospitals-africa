import { computed, Signal, useSignal } from '@preact/signals'
import cls from '../../util/cls.ts'
import { useEffect, useRef } from 'preact/hooks'
import { EmptyState } from '../../components/library/EmptyState.tsx'
import { MagnifyingGlassIcon } from '../../components/library/icons/heroicons/mini.tsx'
import {
  AsyncSearchHookResult,
  EnteredFinding,
  FindingModalMetadata,
  FindingSiteWithMaybeRecords,
  RulesDryRun,
  SnomedWarningSignSearchResult,
  WarningSignWithMaybeRecord,
} from '../../types.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import { FindingModal } from '../finding/Modal.tsx'
import Search from '../Search.tsx'
import { SelectedChips } from '../SelectedRecordChip.tsx'
import { WarningSignsHiddenInputs } from './HiddenInputs.tsx'
import { WarningSignsPriorityTable } from './PriorityTable.tsx'
import {
  CheckedWarningSign,
  findChecked,
  sameSign,
  shouldClearSearchAfterSave,
  signsToDisplay,
  tableCategories,
  ToggleableWarningSign,
  uniqueIdentifier,
} from './shared.ts'
import { FindingSiteFilter } from './FindingSiteFilter.tsx'
import { savedRecordId, warningSignsFormValues } from './form_values.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { findingFullDisplay, insertableFindingFullDisplay } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { RemoveFindingSymbol } from '../finding/RemoveFindingSymbol.tsx'
import negate from '../../util/negate.ts'
import { ClinicalFindingPostBody } from '../../shared/clinical_finding_post.ts'
import { assert } from 'std/assert/assert.ts'
import {
  accumulateFollowUps,
  asCheckedFollowUpSign,
  EMPTY_RULES_DRY_RUN,
  findCheckedFollowUp,
  FollowUpGroup,
  indicatedDiagnosisFollowUp,
  indicatedDiagnosisNode,
  isUnanswered,
  noneOfTheAboveRequests,
} from './follow_ups.ts'
import { FollowUpsPanel } from './FollowUpsPanel.tsx'
import { showAlertMessage } from '../alert/AlertListener.tsx'
import { higherPriority } from '../../shared/priorities.ts'
import { buildPriorityEvaluation, dueToHypotheticalRelation } from '../../shared/priority_evaluation.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { priorityUpdate } from '../DrawerPatientCard.tsx'

const SLIDE_MS = 300
const SLIDE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

function mobileMotion() {
  return globalThis.matchMedia('(max-width: 767px)').matches &&
    !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement
  while (node) {
    const overflow = getComputedStyle(node).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return node
    node = node.parentElement
  }
  return null
}

// Slides an element from where it was on screen to its layout position after the accordion changes.
function slideFrom(el: HTMLElement | null, first: DOMRect | undefined) {
  if (!el || !first) return
  el.getAnimations().forEach((animation) => animation.cancel())
  const dy = first.top - el.getBoundingClientRect().top
  if (Math.abs(dy) < 1) return
  el.animate(
    [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
    { duration: SLIDE_MS, easing: SLIDE_EASING },
  )
}

function asEntered({ priority, clinical_finding_s_expression: s_expression }: WarningSignWithMaybeRecord) {
  const display = insertableFindingFullDisplay(s_expression)
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
  rules_dry_run_route,
  none_of_the_above_findings_route,
  search_results,
  snomed_warning_signs_async_search,
  warning_signs,
  finding_sites,
  finding_site,
}: {
  post_route: string // /app/organizations/[organization_id]/patients/[patient_id]/open_encounter/clinical_finding
  rules_dry_run_route: string | null // .../open_encounter/rules_dry_run, null skips prefetching (tutorial)
  none_of_the_above_findings_route: string | null // .../open_encounter/none_of_the_above_findings, null hides the button (tutorial)
  search_results: Signal<null | WarningSignWithMaybeRecord[]>
  snomed_warning_signs_async_search: AsyncSearchHookResult<SnomedWarningSignSearchResult>
  warning_signs: WarningSignWithMaybeRecord[]
  finding_sites: FindingSiteWithMaybeRecords[] // The body sites the page can be filtered by, none for children
  finding_site: Signal<null | FindingSiteWithMaybeRecords>
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
  const none_of_the_above_saving = useSignal(false)
  // undefined follows the category that should open on its own (search results, or a chosen finding site).
  // null keeps every category collapsed. A category name is the one open on mobile.
  const expanded_category = useSignal<string | null | undefined>(undefined)
  const expansion_view = `${snomed_warning_signs_async_search.search.query}|${finding_site.value?.label ?? ''}`
  const expansion_view_key = useSignal(expansion_view)
  if (expansion_view_key.value !== expansion_view) {
    expansion_view_key.value = expansion_view
    expanded_category.value = undefined
  }

  // Search keeps the input text itself. This remounts it once a save has blanked the hook query,
  // so the field and the results leave search mode on the same render.
  const search_input_key = useSignal(0)
  const search_clear_query = useSignal<null | string>(null)
  // A save's response runs after later renders, so it has to read the query as it is now.
  const search_query_now = useRef(snomed_warning_signs_async_search.search.query)
  search_query_now.current = snomed_warning_signs_async_search.search.query
  if (search_clear_query.value !== null && !search_query_now.current.trim()) {
    search_clear_query.value = null
    search_input_key.value++
  } else if (search_clear_query.value !== null && search_query_now.current !== search_clear_query.value) {
    search_clear_query.value = null
  }

  const root = useRef<HTMLDivElement>(null)
  const slide_timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /*
    Only follow ups still unanswered hold up the page. Ones being saved, whether a checked
    finding or a round of negatives, are answered already and may finish after submitting.
    The tutorial renders this page outside a form, so there is nothing to hold up there.
  */
  useEffect(() => {
    const warning_signs_form = root.current?.closest('form')
    if (!warning_signs_form) return
    function callback(event: SubmitEvent) {
      const unanswered = !none_of_the_above_saving.value &&
        follow_ups_needed.value.some((group) => group.findings_to_check_for.some((finding) => isUnanswered(checked_signs.value, finding)))
      if (unanswered) {
        event.preventDefault()
        event.stopPropagation()
        showAlertMessage({
          message: 'Please answer follow up questions before continuing',
          level: 'warning',
        })
      }
    }
    warning_signs_form.addEventListener('submit', callback)
    return () => warning_signs_form.removeEventListener('submit', callback)
  })

  // Dry-run results keyed by the exact s_expression, held as promises so a save
  // can await a request still in flight. Failed requests are evicted.
  const follow_ups_cache = useRef(new Map<string, Promise<RulesDryRun>>())
  // The first onChange from an opened modal fetches immediately, subsequent edits are debounced
  const modal_prefetched = useRef(false)
  // Records removed on this visit. The signs as rendered still name them, so rechecking one starts afresh
  const retracted_record_ids = useRef(new Set<string>())

  function fetchFollowUps(s_expression: string): Promise<RulesDryRun> {
    if (!rules_dry_run_route) return Promise.resolve(EMPTY_RULES_DRY_RUN)
    const cached = follow_ups_cache.current.get(s_expression)
    if (cached) return cached

    const params = new URLSearchParams({ s_expression })
    const request = fetch(`${rules_dry_run_route}?${params}`, { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`rules_dry_run responded ${response.status}`)
        return await response.json() as RulesDryRun
      })
      .catch((error) => {
        console.error(error)
        follow_ups_cache.current.delete(s_expression)
        return EMPTY_RULES_DRY_RUN
      })
    follow_ups_cache.current.set(s_expression, request)
    return request
  }

  function onModalChange(finding: EnteredFinding) {
    if (modal_prefetched.current) return fetchFollowUps(finding.s_expression)
    modal_prefetched.current = true
    fetchFollowUps(finding.s_expression)
  }

  // The field's query is what decides search mode. search_results can still hold a
  // response from a query that has since been cleared.
  const table_signs_to_display = computed(() =>
    signsToDisplay({
      search_results: snomed_warning_signs_async_search.search.query.trim() ? search_results.value : null,
      finding_site: finding_site.value,
      warning_signs,
    })
  )

  const table_signs_with_checked = computed(() => table_signs_to_display.value.map((sign) => findChecked(checked_signs.value, sign) || sign))

  const grouped = computed(() => groupBy(table_signs_with_checked.value, 'category'))
  const categories = computed(() => tableCategories(finding_site.value))

  const form_values = computed(() => warningSignsFormValues({ warning_signs, checked_signs: checked_signs.value }))

  const active_modal = useSignal<
    null | {
      metadata: FindingModalMetadata
      sign: CheckedWarningSign
      just_checked: boolean
    }
  >(null)

  function onCheck(sign: ToggleableWarningSign) {
    const existing_record = sign.existing_record && !retracted_record_ids.current.has(sign.existing_record.id) ? sign.existing_record : undefined
    const checked_sign = {
      ...sign,
      existing_record,
      entered: sign.entered || asEntered({ ...sign, existing_record }),
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
  }

  function onOpenDetails(sign: CheckedWarningSign) {
    modal_prefetched.current = false
    active_modal.value = {
      sign,
      just_checked: false,
      metadata: asFindingModalMetadata(sign),
    }
  }

  /*
    Removal retracts the record at the id it has, or will have if its save is still in
    flight. Should that fail the sign stays checked so the page still vouches for it.
  */
  function markAsError(sign: CheckedWarningSign, record_id: string) {
    retracted_record_ids.current.add(record_id)
    fetch(`${post_route}/${record_id}/mark_as_error`, {
      method: 'POST',
      headers: { accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`mark_as_error responded ${response.status}: ${await response.text()}`)
        const json = await response.json()
        assert(json.success)
      })
      .catch((error) => {
        console.error(error)
        retracted_record_ids.current.delete(record_id)
        if (checked_signs.value.some((checked) => sameSign(checked, sign))) return
        checked_signs.value = [...checked_signs.value, { ...sign, saving: false }]
      })
  }

  /*
    The input remounts only after the hook query it is clearing has actually gone blank.
    Until then the results stay, and a newer query typed over it cancels the clear.
  */
  function clearSearchAfterSuccessfulSave(query_at_save: string) {
    if (!shouldClearSearchAfterSave(query_at_save, search_query_now.current)) return
    search_clear_query.value = query_at_save
    snomed_warning_signs_async_search.setQuery('')
  }

  function updateSigns(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const active_modal_sign = active_modal.value!.sign
    const isActiveSign = (sign: CheckedWarningSign) => sameSign(sign, active_modal_sign)

    if (finding === RemoveFindingSymbol) {
      checked_signs.value = checked_signs.value.filter(negate(isActiveSign))
      const record_id = savedRecordId(active_modal_sign)
      if (record_id) markAsError(active_modal_sign, record_id)
      return
    }

    const query_at_save = search_query_now.current
    let saved_without_post = false
    let edited: CheckedWarningSign
    checked_signs.value = checked_signs.value.map((sign) => {
      if (!isActiveSign(sign)) return sign
      assert(!edited)

      // Reopening a saved sign and saving it as it was makes no new record
      if (savedRecordId(sign) && sign.entered.s_expression === finding.s_expression) {
        saved_without_post = true
        return edited = { ...sign, entered: finding }
      }

      // Whatever record the sign has is superseded: a positive being edited, one still
      // saving, or a negative from an earlier submission that checking the sign overturns
      const altered_record_id = sign.saving ? sign.saving.as_finding_id : sign.existing_record?.id

      const as_finding_id = crypto.randomUUID()
      const to_post: ClinicalFindingPostBody = {
        finding_id: as_finding_id,
        s_expression: finding.s_expression,
        priority_level: finding.priority,
        altered_record_id,
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
          clearSearchAfterSuccessfulSave(query_at_save)
          checked_signs.value = checked_signs.value.map((sign) => {
            if (!isActiveSign(sign)) return sign
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
    if (saved_without_post) clearSearchAfterSuccessfulSave(query_at_save)
  }

  function onSaveDetails(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const key = uniqueIdentifier(active_modal.value!.sign)
    updateSigns(finding)
    active_modal.value = null

    if (finding === RemoveFindingSymbol) {
      follow_ups_needed.value = accumulateFollowUps(follow_ups_needed.value, { key, due_to: null, findings_to_check_for: [] })
      return
    }

    // Usually already resolved having been prefetched while the modal was open
    fetchFollowUps(finding.s_expression).then((dry_run) => {
      const finding_base_priority = higherPriority(finding.priority, dry_run.would_indicate_priority)
      const priority_update = [
        finding_base_priority,
        ...dry_run.would_indicate_diagnoses.map((d) => d.would_indicate_priority),
      ].reduce(higherPriority)

      // TODO: super edge case, but if the would_indicate_priority is based on a combination of findings
      // and one of those depencies is subsequently removed this will then be wrong.
      // The previous priority has already been saved to the backend via POST clinical_finding
      // with only the record_id confirmed on POST of the warning_signs page, so this value will only live
      // on the frontend and if it is indeed later wrong the backend should sort it out
      if (priority_update && priority_update !== finding.priority) {
        finding.priority = priority_update
      }
      // The sign's own group first, so that folding it in sweeps the diagnosis groups of its last save
      follow_ups_needed.value = [
        { key, due_to: finding, findings_to_check_for: dry_run.findings_to_check_for },
        ...dry_run.would_indicate_diagnoses.map((indicated) => indicatedDiagnosisFollowUp(key, indicated)),
      ].reduce(accumulateFollowUps, follow_ups_needed.value)

      if (priority_update) {
        // The priority is due to whichever of the sign and the diagnoses it would indicate raise triage this high
        const due_to = [
          ...(finding_base_priority === priority_update ? [parseSExpressionAsInsertableFinding(finding.s_expression)] : []),
          ...compactMap(
            dry_run.would_indicate_diagnoses,
            (indicated) =>
              indicated.would_indicate_priority === priority_update &&
              diagnosisToEvaluation(indicatedDiagnosisNode(indicated.diagnosis)),
          ),
        ].map(dueToHypotheticalRelation)

        priorityUpdate({
          priority: priority_update,
          priority_evaluation: buildPriorityEvaluation({
            priority: priority_update,
            created_at: new Date(),
            due_to,
          }),
        })
      }

      // Follow ups already recorded as present in this encounter start out checked
      const already_present = compactMap(dry_run.findings_to_check_for, (follow_up) => {
        if (findCheckedFollowUp(checked_signs.value, follow_up)) return
        return asCheckedFollowUpSign(follow_up)
      })
      if (already_present.length) {
        checked_signs.value = [...checked_signs.value, ...already_present]
      }
    })
  }

  function onToggleExpanded(category: string, is_open: boolean) {
    const next = is_open ? null : category
    const current = typeof expanded_category.value === 'string' ? expanded_category.value : null
    if (slide_timer.current) {
      clearTimeout(slide_timer.current)
      slide_timer.current = null
    }
    if (mobileMotion() && current && next && current !== next) {
      slideCategory(current, null)
      slide_timer.current = globalThis.setTimeout(() => slideCategory(next, next), SLIDE_MS)
      return
    }
    slideCategory(category, next)
  }

  function slideCategory(category: string, next: string | null) {
    const root_el = root.current
    if (!root_el || !mobileMotion()) {
      expanded_category.value = next
      return
    }
    const card = root_el.querySelector(`[data-category="${category}"]`) as HTMLElement | null
    const toolbar = root_el.querySelector('#warning-signs-toolbar') as HTMLElement | null
    const first_card = card?.getBoundingClientRect()
    const first_toolbar = toolbar?.getBoundingClientRect()
    expanded_category.value = next
    requestAnimationFrame(() => {
      const scroller = card ? scrollParent(card) : null
      // The content scroller sits under the workflow nav. Resetting it parks the opened category there.
      if (scroller && next) scroller.scrollTop = 0
      slideFrom(card, first_card)
      slideFrom(toolbar, first_toolbar)
    })
  }

  /*
    The panel closes at once, leaving a spinner in its place. The groups answered stay in
    follow_ups_needed until their negatives are recorded, so a failure reopens the panel,
    while a group arriving from a save made meanwhile is left alone.
  */
  async function onNoneOfTheAbove() {
    if (!none_of_the_above_findings_route || none_of_the_above_saving.value) return
    none_of_the_above_saving.value = true
    const answered = new Set(follow_ups_needed.value.map((group) => group.key))

    try {
      // One after another so a finding checked for by two tasks is only recorded once
      for (const request of noneOfTheAboveRequests(follow_ups_needed.value, checked_signs.value)) {
        const response = await fetch(none_of_the_above_findings_route, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error(`none_of_the_above_findings responded ${response.status}: ${await response.text()}`)
        const json = await response.json()
        assert(json.success)
      }
      follow_ups_needed.value = follow_ups_needed.value.filter((group) => !answered.has(group.key))
    } catch (error) {
      // The panel reopens so the health worker can try again
      console.error(error)
    } finally {
      none_of_the_above_saving.value = false
    }
  }

  return (
    <div
      className={cls(
        'flex flex-col gap-2 md:gap-1.25 2xl:gap-4 w-full',
        // Fills the triage content pane so an open category can scroll above the search row.
        'max-md:min-h-0 max-md:flex-1 max-md:bg-white',
        'max-md:[&:has([data-expanded=true])>.priority-table:not([data-expanded=true])]:hidden',
        'max-md:[&:has([data-expanded=true])>#warning-signs-toolbar]:order-1',
        'max-md:[&:has([data-expanded=true])>#warning-signs-toolbar]:mt-auto',
        'max-md:[&:has([data-expanded=true])>#warning-signs-toolbar]:flex-col-reverse',
      )}
      id='warning-signs'
      ref={root}
    >
      <div
        id='warning-signs-toolbar'
        className={cls(
          'sticky top-0 z-10 bg-white flex flex-col gap-1 pb-1',
          'max-md:static! max-md:z-auto max-md:shrink-0 max-md:gap-1.5 max-md:bg-transparent max-md:p-0',
          // Focus on the chief-complaint field, not the finding-site button, pins this row under the list.
          'max-md:has-[input:focus]:order-1 max-md:has-[input:focus]:mt-auto max-md:has-[input:focus]:flex-col-reverse',
        )}
      >
        <div className='flex min-w-0 items-stretch gap-2 max-md:h-12'>
          <div className='min-w-0 flex-1 max-md:[&_input]:h-12 max-md:[&_input]:rounded-md max-md:[&_input]:border-0 max-md:[&_input]:px-3 max-md:[&_input]:shadow-[inset_0_0_0_1.5px_#111827] max-md:[&_input]:text-[14px] max-md:[&_input]:leading-[24px] max-md:[&_input]:outline-none! max-md:[&_input]:focus:shadow-[inset_0_0_0_1.5px_#4338ca] max-md:[&_input]:focus:outline-none!'>
            <Search
              key={search_input_key.value}
              id='warning-signs-search'
              placeholder='Chief complaint'
              data-searchroute={snomed_warning_signs_async_search.search_route}
              options={snomed_warning_signs_async_search.results}
              onQuery={snomed_warning_signs_async_search.setQuery}
              loading_options={snomed_warning_signs_async_search.loading}
              do_not_render_built_in_options
              is_async
            />
          </div>
          {finding_sites.length > 0 && (
            <FindingSiteFilter
              finding_sites={finding_sites}
              selected={finding_site.value}
              onSelect={(selected) => finding_site.value = selected}
            />
          )}
        </div>
        <div className='flex flex-col gap-1 max-md:gap-1.5'>
          {!checked_signs.value.length && (
            <p className='md:hidden text-[12px] font-normal leading-[16px] text-gray-500'>
              No findings selected
            </p>
          )}
          <div className={cls(!checked_signs.value.length && 'max-md:hidden')}>
            <SelectedChips
              id='warning-signs-selected-chips'
              items={checked_signs.value}
              onEdit={onOpenDetails}
            />
          </div>
        </div>
      </div>
      {grouped.value.size === 0 && (
        <EmptyState
          header='No findings found matching that search or its aliases'
          explanation='Try a different search'
          icon={<MagnifyingGlassIcon className='h-5 w-5' />}
        />
      )}
      {categories.value.map((config) => {
        const start_expanded = config.category === 'Search Results' || config.category === finding_site.value?.label
        const expanded = expanded_category.value === undefined ? start_expanded : expanded_category.value === config.category
        return (
          <WarningSignsPriorityTable
            {...config}
            onCheck={onCheck}
            onOpenDetails={onOpenDetails}
            key={config.category}
            expanded={expanded}
            onToggleExpanded={() => onToggleExpanded(config.category, expanded)}
            signs={grouped.value.get(config.category) || []}
          />
        )
      })}
      <WarningSignsHiddenInputs form_values={form_values.value} />
      <FindingModal
        finding={active_modal.value && {
          metadata: active_modal.value.metadata,
          just_checked: active_modal.value.just_checked,
          entered: active_modal.value.sign.entered,
        }}
        selected_finding_site={finding_site.value?.snomed_concept}
        onSave={onSaveDetails}
        onChange={onModalChange}
        onClose={() => active_modal.value = null}
      />
      <FollowUpsPanel
        groups={follow_ups_needed.value}
        checked_signs={checked_signs.value}
        onCheck={onCheck}
        onOpenDetails={onOpenDetails}
        onNoneOfTheAbove={onNoneOfTheAbove}
        none_of_the_above_saving={none_of_the_above_saving.value}
        onDismiss={() => follow_ups_needed.value = []}
      />
    </div>
  )
}
