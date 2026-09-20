import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { FollowUpGroup } from '../../types.ts'
import { addFindingEventListener } from '../../shared/finding_events.ts'
import compactMap from '../../util/compactMap.ts'
import { useRecordedFindings } from '../finding/useRecordedFindings.ts'
import { useSubmitGuard } from '../finding/useSubmitGuard.ts'
import { accumulateFollowUps, asRecordedFollowUp, markRecordedAbsent, openFollowUp, retractFollowUps, someUnanswered } from './follow_ups.ts'
import { postNoneOfTheAbove } from './none_of_the_above.ts'
import { FollowUpsPanelContents } from './PanelContents.tsx'

/*
  The follow ups panel of a workflow page (OpenEncounterWorkflowLayout). Starts out with the
  check_for tasks the encounter has outstanding, then accumulates the groups each saved
  finding raises as the recorder reports them (shared/finding_events.ts).

  Only follow ups still unanswered hold up the page. Ones being saved, whether a checked
  finding or a round of negatives, are answered already and may finish after submitting.
*/
export default function FollowUpsPanel({ initial_groups, none_of_the_above_findings_route, form_id }: {
  initial_groups: FollowUpGroup[]
  none_of_the_above_findings_route: string
  form_id: string
}) {
  const groups = useSignal(initial_groups)
  const recorded = useRecordedFindings(() => compactMap(initial_groups.flatMap((group) => group.findings_to_check_for), asRecordedFollowUp))
  const none_of_the_above_saving = useSignal(false)

  useEffect(() => {
    const removers = [
      addFindingEventListener('follow-ups:accumulate', ({ key, groups: raised }) => {
        groups.value = raised.length ? raised.reduce(accumulateFollowUps, groups.value) : retractFollowUps(groups.value, key)
      }),
      addFindingEventListener('findings:recorded-absent', ({ records }) => {
        groups.value = markRecordedAbsent(groups.value, records)
      }),
    ]
    return () => removers.forEach((remove) => remove())
  }, [])

  useSubmitGuard(form_id, () => !none_of_the_above_saving.value && someUnanswered(groups.value, recorded.value))

  /*
    The panel closes at once, leaving a spinner in its place. The groups answered stay in
    place until their negatives are recorded, so a failure reopens the panel, while a group
    arriving from a save made meanwhile is left alone.
  */
  async function onNoneOfTheAbove() {
    if (none_of_the_above_saving.value) return
    none_of_the_above_saving.value = true
    const answered = new Set(groups.value.map((group) => group.key))
    try {
      await postNoneOfTheAbove(none_of_the_above_findings_route, groups.value, recorded.value)
      groups.value = groups.value.filter((group) => !answered.has(group.key))
    } catch (error) {
      // The panel reopens so the health worker can try again
      console.error(error)
    } finally {
      none_of_the_above_saving.value = false
    }
  }

  return (
    <FollowUpsPanelContents
      groups={groups.value}
      recorded={recorded.value}
      onCheck={(finding) => openFollowUp(finding, undefined)}
      onOpenDetails={openFollowUp}
      onNoneOfTheAbove={onNoneOfTheAbove}
      none_of_the_above_saving={none_of_the_above_saving.value}
      onDismiss={() => groups.value = []}
    />
  )
}
