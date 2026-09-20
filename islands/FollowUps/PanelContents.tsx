import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Button } from '../../components/library/Button.tsx'
import { Spinner } from '../../components/library/Spinner.tsx'
import { FollowUpGroup, RecordedFinding } from '../../types.ts'
import { SIDE_PANEL_CLASS, SIDE_PANEL_ORDER } from '../../components/library/layout/side_panels.ts'
import cls from '../../util/cls.ts'
import { FollowUpGroupSection, OnCheckFollowUp, OnOpenFollowUpDetails } from './GroupSection.tsx'

/*
  Shown as soon as a finding is saved to the record, listing what to check for as a
  result, and on page load with the check_for tasks the encounter already has outstanding.
  Not a modal: no backdrop, no focus trap, the page stays usable behind it.

  Rendered by the page layout inside the shared column left of the patient drawer, so that
  its inputs sit outside the workflow's form and are not submitted with the page. That
  column owns the position, width and height cap, and is where the priority escalation
  panel stacks above this one (components/library/layout/side_panels.ts).

  Checking a follow up behaves exactly like checking a warning sign. "None of the above"
  closes the panel at once, leaving a spinner in its place while the negatives save.
*/
export function FollowUpsPanelContents({ groups, recorded, onCheck, onOpenDetails, onNoneOfTheAbove, none_of_the_above_saving, onDismiss }: {
  groups: FollowUpGroup[]
  recorded: RecordedFinding[]
  none_of_the_above_saving: boolean
  onCheck: OnCheckFollowUp
  onOpenDetails: OnOpenFollowUpDetails
  onNoneOfTheAbove(): void
  onDismiss(): void
}) {
  if (none_of_the_above_saving) {
    return (
      <div
        id='follow-ups-saving'
        className={cls(
          'pointer-events-auto self-start flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl border border-gray-200 text-sm text-gray-600',
          SIDE_PANEL_ORDER.follow_ups,
        )}
      >
        <Spinner className='text-indigo-700' aria-hidden='true' />
        Saving…
      </div>
    )
  }

  if (!groups.length) return null

  return (
    <div
      id='follow-ups-panel'
      className={cls(SIDE_PANEL_CLASS, SIDE_PANEL_ORDER.follow_ups)}
    >
      <div className='shrink-0 flex items-center justify-between px-5 pt-4 pb-3'>
        <h2 className='text-lg font-bold text-gray-900'>Follow ups to check for</h2>
        <button
          type='button'
          aria-label='Dismiss follow ups'
          className='rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          onClick={onDismiss}
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      </div>
      <div className='min-h-0 overflow-y-auto px-5 pb-3 flex flex-col gap-4'>
        {groups.map((group) => (
          <FollowUpGroupSection
            key={group.key}
            group={group}
            recorded={recorded}
            onCheck={onCheck}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
      <div className='shrink-0 flex justify-end px-5 pb-4 pt-2 border-t border-gray-100'>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          id='follow-ups-none-of-the-above'
          onClick={onNoneOfTheAbove}
        >
          None of the above
        </Button>
      </div>
    </div>
  )
}
