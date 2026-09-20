import { useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import type { EnteredFinding, FindingModalMetadata, FindingRoutes, RulesDryRun } from '../../types.ts'
import { asFindingModalMetadata } from './metadata.ts'
import { addFindingEventListener, dispatchFindingEvent, FindingEvents } from '../../shared/finding_events.ts'
import { ClinicalFindingPostBody, ClinicalFindingPostResponse } from '../../shared/clinical_finding_post.ts'
import { higherPriority } from '../../shared/priorities.ts'
import { buildPriorityEvaluation, dueToHypotheticalRelation } from '../../shared/priority_evaluation.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import compactMap from '../../util/compactMap.ts'
import { exists } from '../../util/exists.ts'
import { FindingModal } from './Modal.tsx'
import { RemoveFindingSymbol } from './RemoveFindingSymbol.tsx'
import { priorityUpdate } from '../DrawerPatientCard.tsx'
import { EMPTY_RULES_DRY_RUN, indicatedDiagnosisFollowUp, indicatedDiagnosisNode } from '../FollowUps/follow_ups.ts'

/*
  The one finding modal of a workflow page, and the recording behind it. Rendered by
  OpenEncounterWorkflowLayout so that a finding can be recorded from any page: the warning
  signs tables, the follow ups panel, the check_for section of the additional tasks page.

  Lists ask for the modal with finding:open and learn what became of it from the finding:*
  events (shared/finding_events.ts). The recorder itself keeps no list of findings, only
  the dry-run cache and the records retracted on this visit.
*/
type Opened = Omit<FindingEvents['finding:open'], 'metadata'> & { metadata: FindingModalMetadata }

/*
  Without routes (the tutorial) nothing is posted: findings are entered and reported as
  recorded at once, and no follow ups are looked up.
*/
export default function FindingRecorder({ routes }: { routes: FindingRoutes | null }) {
  const active = useSignal<null | Opened>(null)
  // What each finding was last opened with, for a list that has no sign for it (see finding:open)
  const remembered_metadata = useRef(new Map<string, FindingModalMetadata>())

  // Dry-run results keyed by the exact s_expression, held as promises so a save
  // can await a request still in flight. Failed requests are evicted.
  const follow_ups_cache = useRef(new Map<string, Promise<RulesDryRun>>())
  // The first onChange from an opened modal fetches immediately, subsequent edits are debounced
  const modal_prefetched = useRef(false)
  // Records removed on this visit. The lists as rendered still name them, so rechecking one starts afresh
  const retracted_record_ids = useRef(new Set<string>())

  useEffect(() =>
    addFindingEventListener('finding:open', (detail) => {
      modal_prefetched.current = false
      const metadata = detail.metadata ||
        remembered_metadata.current.get(detail.key) ||
        asFindingModalMetadata({
          clinical_finding_s_expression: detail.entered.s_expression,
          priority: detail.entered.priority,
          predefined_attributes: [],
          relevant_qualifiers: [],
          onset_required: false,
        })
      remembered_metadata.current.set(detail.key, metadata)
      active.value = { ...detail, metadata }
    }), [])

  function fetchFollowUps(s_expression: string): Promise<RulesDryRun> {
    if (!routes) return Promise.resolve(EMPTY_RULES_DRY_RUN)
    const cached = follow_ups_cache.current.get(s_expression)
    if (cached) return cached

    const params = new URLSearchParams({ s_expression })
    const request = fetch(`${routes.rules_dry_run_route}?${params}`, { headers: { accept: 'application/json' } })
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

  function existingOf({ existing }: Opened) {
    if (!existing || retracted_record_ids.current.has(existing.record_id)) return null
    return existing
  }

  /*
    Removal retracts the record at the id it has, or will have if its save is still in
    flight. Should that fail the finding is restored so the page still vouches for it.
  */
  function remove(opened: Opened) {
    const { key } = opened
    dispatchFindingEvent('follow-ups:accumulate', { key, groups: [], already_present: [] })

    const existing = existingOf(opened)
    if (existing?.existence !== 'Yes') return
    const { record_id } = existing

    retracted_record_ids.current.add(record_id)
    dispatchFindingEvent('finding:removed', { key, record_id })
    if (!routes) return
    fetch(`${routes.post_route}/${record_id}/mark_as_error`, {
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
        dispatchFindingEvent('finding:remove-failed', { key, recorded: { key, entered: opened.entered, record_id, saving: false } })
      })
  }

  function save(opened: Opened, finding: EnteredFinding) {
    const { key } = opened
    const existing = existingOf(opened)

    // Reopening a saved finding and saving it as it was makes no new record
    const unchanged = !opened.just_checked && existing?.existence === 'Yes' && opened.entered.s_expression === finding.s_expression
    if (!unchanged) {
      const as_finding_id = crypto.randomUUID()
      dispatchFindingEvent('finding:entered', { key, entered: finding, record_id: as_finding_id, saving: !!routes })
      if (!routes) return

      // Whatever record the finding has is superseded: a positive being edited, one still
      // saving, or a negative from an earlier submission that checking the finding overturns
      const to_post: ClinicalFindingPostBody = {
        finding_id: as_finding_id,
        s_expression: finding.s_expression,
        priority_level: finding.priority,
        altered_record_id: existing?.record_id,
      }
      fetch(routes.post_route, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(to_post),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`clinical_finding responded ${response.status}: ${await response.text()}`)
          const json = await response.json() as ClinicalFindingPostResponse
          assert(json.success)
          dispatchFindingEvent('finding:recorded', { key, record: json.record })
        })
        .catch((error) => {
          console.error(error)
          dispatchFindingEvent('finding:save-failed', { key, record_id: as_finding_id })
        })
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
      // with only the record_id confirmed on POST of the page, so this value will only live
      // on the frontend and if it is indeed later wrong the backend should sort it out
      if (priority_update && priority_update !== finding.priority) {
        finding.priority = priority_update
      }

      // The sign's own group first, so that folding it in sweeps the diagnosis groups of its last save
      dispatchFindingEvent('follow-ups:accumulate', {
        key,
        groups: [
          { key, due_to: finding, findings_to_check_for: dry_run.findings_to_check_for },
          ...dry_run.would_indicate_diagnoses.map((indicated) => indicatedDiagnosisFollowUp(key, indicated)),
        ],
        // Follow ups already recorded as present in this encounter start out checked
        already_present: dry_run.findings_to_check_for.filter((follow_up) => follow_up.existing_record?.existence === 'Yes'),
      })

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
    })
  }

  function onSave(finding: EnteredFinding | typeof RemoveFindingSymbol) {
    const opened = exists(active.value)
    active.value = null
    if (finding === RemoveFindingSymbol) return remove(opened)
    save(opened, finding)
  }

  return (
    <FindingModal
      finding={active.value && {
        metadata: active.value.metadata,
        just_checked: active.value.just_checked,
        entered: active.value.entered,
      }}
      onSave={onSave}
      onChange={onModalChange}
      onClose={() => active.value = null}
    />
  )
}
