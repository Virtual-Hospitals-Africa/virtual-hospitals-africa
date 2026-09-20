import { computed, Signal, useSignal } from '@preact/signals'
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
import { CheckedWarningSign, findChecked, sameSign, signsToDisplay, tableCategories, ToggleableWarningSign, uniqueIdentifier } from './shared.ts'
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
import { exists } from '../../util/exists.ts'
import { showAlertMessage } from '../alert/AlertListener.tsx'
import { higherPriority } from '../../shared/priorities.ts'
import { buildPriorityEvaluation, dueToHypotheticalRelation } from '../../shared/priority_evaluation.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { priorityUpdate } from '../DrawerPatientCard.tsx'

function asEntered({ priority, clinical_finding_s_expression: s_expression }: WarningSignWithMaybeRecord) {
  const display = insertableFindingFullDisplay(s_expression)
  return { s_expression, priority, display }
}

// TODO we technically only need this on-demand when launching the modal, hence calling it as such
// Could be memoized
// TODO when working on making a FindingsModal that's actually reusable we may want to make aspects of this logic more portable
function asFindingModalMetadata({
  priority,
  chosen_finding_site,
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
    chosen_finding_site,
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

  /*
    Only follow ups still unanswered hold up the page. Ones being saved, whether a checked
    finding or a round of negatives, are answered already and may finish after submitting.
  */
  useEffect(() => {
    const warning_signs_form = exists(document.getElementById('warning_signs'))
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

  const table_signs_to_display = computed(() => signsToDisplay({ search_results: search_results.value, finding_site: finding_site.value, warning_signs }))

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

  function updateSigns(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const active_modal_sign = active_modal.value!.sign
    const isActiveSign = (sign: CheckedWarningSign) => sameSign(sign, active_modal_sign)

    if (finding === RemoveFindingSymbol) {
      checked_signs.value = checked_signs.value.filter(negate(isActiveSign))
      const record_id = savedRecordId(active_modal_sign)
      if (record_id) markAsError(active_modal_sign, record_id)
      return
    }

    let edited: CheckedWarningSign
    checked_signs.value = checked_signs.value.map((sign) => {
      if (!isActiveSign(sign)) return sign
      assert(!edited)

      // Reopening a saved sign and saving it as it was makes no new record
      if (savedRecordId(sign) && sign.entered.s_expression === finding.s_expression) {
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
    <div className='flex flex-col gap-1.25 2xl:gap-4 w-full' id='warning-signs'>
      <div className='sticky top-0 z-10 bg-white flex flex-col gap-1 pb-1'>
        <div className='flex gap-2 items-stretch'>
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
          {finding_sites.length > 0 && (
            <FindingSiteFilter
              finding_sites={finding_sites}
              selected={finding_site.value}
              onSelect={(selected) => finding_site.value = selected}
            />
          )}
        </div>
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
      {categories.value.map((config) => (
        <WarningSignsPriorityTable
          {...config}
          onCheck={onCheck}
          onOpenDetails={onOpenDetails}
          key={config.category}
          signs={grouped.value.get(config.category) || []}
        />
      ))}
      <WarningSignsHiddenInputs form_values={form_values.value} />
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
