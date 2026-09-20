import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { Button } from '../../components/library/Button.tsx'
import { Spinner } from '../../components/library/Spinner.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import { FollowUpGroup } from '../../types.ts'
import { addFindingEventListener } from '../../shared/finding_events.ts'
import compactMap from '../../util/compactMap.ts'
import { useRecordedFindings } from '../finding/useRecordedFindings.ts'
import { useSubmitGuard } from '../finding/useSubmitGuard.ts'
import { asRecordedFollowUp, markRecordedAbsent, openFollowUp, someUnanswered } from './follow_ups.ts'
import { FollowUpGroupSection } from './GroupSection.tsx'
import { postNoneOfTheAbove } from './none_of_the_above.ts'

/*
  The check_for tasks outstanding when the additional tasks page loaded, in the body of the
  page rather than the follow ups panel. Checking one opens the finding modal as anywhere
  else; the follow ups that save raises go to the panel. The groups stay put once answered,
  their findings rolled up as previously absent.

  Its checkboxes carry no name, so although it sits inside the workflow's form nothing of
  it is submitted with the page: the findings are recorded as they are answered and the
  tasks marked done by "None of the above". Without a route (the tutorial) the button is hidden.
*/
export default function CheckForSection({ groups: initial_groups, none_of_the_above_findings_route, form_id, page_mixed_completion = false }: {
  groups: FollowUpGroup[]
  none_of_the_above_findings_route: string | null
  form_id: string
  // The page was submitted before and these tasks are new since, so they are marked as follow ups
  page_mixed_completion?: boolean
}) {
  const groups = useSignal(initial_groups)
  const recorded = useRecordedFindings(() => compactMap(initial_groups.flatMap((group) => group.findings_to_check_for), asRecordedFollowUp))
  const saving = useSignal(false)
  const error = useSignal<string | null>(null)

  useEffect(() =>
    addFindingEventListener('findings:recorded-absent', ({ records }) => {
      groups.value = markRecordedAbsent(groups.value, records)
    }), [])

  useSubmitGuard(form_id, () => !saving.value && someUnanswered(groups.value, recorded.value))

  async function onNoneOfTheAbove() {
    if (!none_of_the_above_findings_route || saving.value) return
    saving.value = true
    error.value = null
    try {
      await postNoneOfTheAbove(none_of_the_above_findings_route, groups.value, recorded.value)
    } catch (err) {
      console.error(err)
      error.value = 'Something went wrong recording these findings. Please try again.'
    } finally {
      saving.value = false
    }
  }

  if (!groups.value.length) return null
  const unanswered = someUnanswered(groups.value, recorded.value)

  return (
    <div id='check-for-section' className='flex flex-col gap-4'>
      <SectionHeader className='w-full xl:w-60'>
        Check for
      </SectionHeader>
      {groups.value.map((group) => (
        <FollowUpGroupSection
          key={group.key}
          group={group}
          recorded={recorded.value}
          is_follow_up={page_mixed_completion}
          onCheck={(finding) => openFollowUp(finding, undefined)}
          onOpenDetails={openFollowUp}
        />
      ))}
      {error.value && <div className='text-sm text-red-600'>{error.value}</div>}
      {none_of_the_above_findings_route && unanswered && (
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            id='check-for-none-of-the-above'
            disabled={saving.value}
            onClick={onNoneOfTheAbove}
          >
            None of the above
          </Button>
          {saving.value && <Spinner className='text-indigo-700' aria-hidden='true' />}
        </div>
      )}
    </div>
  )
}
