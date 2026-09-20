import type {
  EnteredFinding,
  Existence,
  FindingModalMetadata,
  FindingToCheckFor,
  FollowUpGroup,
  RecordedFinding,
  RenderedFindingRelativeToHealthWorker,
} from '../types.ts'

/*
  The islands of a workflow page that deal in findings know nothing of each other: the
  warning signs tables, the check_for section of the additional tasks page, the follow ups
  panel, the finding recorder that owns the modal and the drawer. They coordinate through
  CustomEvents on `self`, as the priority escalation already does (islands/DrawerPatientCard.tsx).

  finding:open              a list asks the recorder to open the finding modal
  finding:entered           the recorder has an entered finding and is posting it
  finding:recorded          the post succeeded; carries the record as the drawer renders it
  finding:save-failed       the post failed; the finding stays entered but is no longer saving
  finding:removed           the recorder is retracting a record
  finding:remove-failed     the retraction failed; the finding is back
  follow-ups:accumulate     the dry run of a saved finding resolved with the groups it raises
  findings:recorded-absent  a round of "none of the above" recorded these findings as No

  Every island that lists findings keeps its own RecordedFinding[] mirror, updated by the
  finding:* events through islands/finding/useRecordedFindings.ts.
*/
export type FindingEvents = {
  'finding:open': {
    key: string
    // Absent when the list has no sign for the finding, as for a chip of a follow up recorded
    // from the panel: the recorder then reuses what it last opened the finding with
    metadata: FindingModalMetadata | null
    entered: EnteredFinding
    just_checked: boolean
    // The record the finding already has, whose id a save supersedes and Remove retracts
    existing: null | { record_id: string; existence: Existence }
  }
  'finding:entered': RecordedFinding
  'finding:recorded': { key: string; record: RenderedFindingRelativeToHealthWorker }
  'finding:save-failed': { key: string; record_id: string }
  'finding:removed': { key: string; record_id: string }
  'finding:remove-failed': { key: string; recorded: RecordedFinding }
  'follow-ups:accumulate': { key: string; groups: FollowUpGroup[]; already_present: FindingToCheckFor[] }
  'findings:recorded-absent': { records: { id: string; s_expression: string }[] }
}

export type FindingEventType = keyof FindingEvents

export function dispatchFindingEvent<K extends FindingEventType>(type: K, detail: FindingEvents[K]): void {
  self.dispatchEvent(new CustomEvent(type, { detail }))
}

// Returns the function that removes the listener
export function addFindingEventListener<K extends FindingEventType>(
  type: K,
  listener: (detail: FindingEvents[K]) => void,
): () => void {
  function callback(event: Event) {
    if (!(event instanceof CustomEvent)) return
    listener(event.detail as FindingEvents[K])
  }
  self.addEventListener(type, callback)
  return () => self.removeEventListener(type, callback)
}
