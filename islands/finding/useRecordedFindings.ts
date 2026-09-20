import { Signal, useSignal } from '@preact/signals'
import { useEffect, useMemo } from 'preact/hooks'
import type { RecordedFinding } from '../../types.ts'
import { addFindingEventListener } from '../../shared/finding_events.ts'
import { asRecordedFollowUp } from '../FollowUps/follow_ups.ts'

/*
  The findings recorded, or being recorded, on this page as one island sees them: seeded
  from what the server rendered the island with, then kept current by the finding events
  the recorder dispatches (shared/finding_events.ts). Every island that lists findings
  keeps one of these, so all of them agree.

  Follow ups the dry run reports as already present in this encounter join too, as they
  did when the warning signs page kept the single list, so that they show as checked
  wherever they are listed.
*/
export function useRecordedFindings(initial: () => RecordedFinding[]): Signal<RecordedFinding[]> {
  const initial_value = useMemo(initial, [])
  const recorded = useSignal<RecordedFinding[]>(initial_value)

  useEffect(() => {
    const removers = [
      addFindingEventListener('finding:entered', (entered) => {
        recorded.value = [...recorded.value.filter((finding) => finding.key !== entered.key), entered]
      }),
      addFindingEventListener('finding:recorded', ({ key, record }) => {
        recorded.value = recorded.value.map((finding) => finding.key === key && finding.record_id === record.id ? { ...finding, saving: false } : finding)
      }),
      addFindingEventListener('finding:save-failed', ({ key, record_id }) => {
        // The finding stays entered so it is still submitted with the page, but is no longer marked as saving
        recorded.value = recorded.value.map((finding) =>
          finding.key === key && finding.record_id === record_id ? { ...finding, saving: false, failed: true } : finding
        )
      }),
      addFindingEventListener('finding:removed', ({ key, record_id }) => {
        recorded.value = recorded.value.filter((finding) => finding.key !== key && finding.record_id !== record_id)
      }),
      addFindingEventListener('finding:remove-failed', ({ recorded: restored }) => {
        if (recorded.value.some((finding) => finding.record_id === restored.record_id)) return
        recorded.value = [...recorded.value, restored]
      }),
      addFindingEventListener('follow-ups:accumulate', ({ already_present }) => {
        const known = new Set(recorded.value.map((finding) => finding.record_id))
        const joining = already_present.flatMap((finding) => {
          const as_recorded = asRecordedFollowUp(finding)
          return as_recorded && !known.has(as_recorded.record_id) ? [as_recorded] : []
        })
        if (joining.length) recorded.value = [...recorded.value, ...joining]
      }),
    ]
    return () => removers.forEach((remove) => remove())
  }, [])

  return recorded
}
