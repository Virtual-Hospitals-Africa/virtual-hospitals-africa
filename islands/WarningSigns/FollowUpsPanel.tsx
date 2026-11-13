import { createPortal } from 'preact/compat'
import { useState } from 'preact/hooks'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Button } from '../../components/library/Button.tsx'
import { CheckboxList } from '../../components/library/CheckboxList.tsx'
import { Spinner } from '../../components/library/Spinner.tsx'
import { FindingToCheckFor } from '../../types.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { SelectedChip } from '../SelectedRecordChip.tsx'
import { asFollowUpSign, findCheckedFollowUp, followUpDisplay, FollowUpGroup } from './follow_ups.ts'
import { CheckedWarningSign, OnToggle } from './shared.ts'
import { pluralize } from '../../util/pluralize.ts'
import { SIDE_PANEL_BACKDROP_CLASS, SIDE_PANEL_CLASS, SIDE_PANEL_ORDER, sidePanelHost } from '../../components/library/layout/side_panels.ts'
import cls from '../../util/cls.ts'

type Item = {
  id: string
  label: string
  checked: boolean
  previously_absent: boolean
  finding: FindingToCheckFor
  checked_sign?: CheckedWarningSign
}

function asItem(group: FollowUpGroup, checked_signs: CheckedWarningSign[], finding: FindingToCheckFor): Item {
  const checked_sign = findCheckedFollowUp(checked_signs, finding)
  const display = followUpDisplay(finding.s_expression)
  return {
    id: `follow-up.${group.key}.${hyphenate(display)}`,
    label: display,
    checked: !!checked_sign,
    previously_absent: !checked_sign && finding.existing_record?.existence === 'No',
    finding,
    checked_sign,
  }
}

/*
  The follow ups for one sign: what is still to check for as checkboxes, what has been checked
  as record pills like those atop the page, and whatever was already recorded as absent rolled
  up behind a count so the still-open questions are what the eye lands on.
*/
function FollowUpGroupSection({ group, checked_signs, onCheck, onOpenDetails }: {
  group: FollowUpGroup
  checked_signs: CheckedWarningSign[]
  onCheck: OnToggle
  onOpenDetails(sign: CheckedWarningSign): void
}) {
  const [showing_previously_absent, setShowingPreviouslyAbsent] = useState(false)

  const items = group.findings_to_check_for.map((finding) => asItem(group, checked_signs, finding))
  const checked = items.filter((item) => item.checked)
  const to_check = items.filter((item) => !item.checked && !item.previously_absent)
  const previously_absent = items.filter((item) => item.previously_absent)

  return (
    <div className='flex flex-col gap-2 max-md:min-w-0 max-md:gap-3 max-md:border-t max-md:border-gray-100 max-md:pt-4 max-md:first:border-t-0 max-md:first:pt-0'>
      <div className='text-sm leading-5 max-md:break-words' data-due-to={hyphenate(group.due_to.display)}>
        <span className='font-semibold text-gray-600 mr-1'>Due to</span>
        <span className='text-gray-900'>{group.due_to.display}</span>
      </div>
      {!!checked.length && (
        <div
          className='flex flex-wrap gap-1 max-md:min-w-0 max-md:[&_button]:max-w-full max-md:[&_button]:whitespace-normal max-md:[&_button]:text-left'
          id={`follow-ups-checked-${group.key}`}
        >
          {checked.map((item) => (
            <SelectedChip
              key={item.id}
              item={item.checked_sign!}
              click_action='edit'
              onClick={() => onOpenDetails(item.checked_sign!)}
            />
          ))}
        </div>
      )}
      {!!to_check.length && (
        <CheckboxList
          id={`follow-ups-${group.key}`}
          items={to_check}
          onCheck={(item) => onCheck(asFollowUpSign(item.finding))}
        />
      )}
      {!!previously_absent.length && (
        <>
          <button
            type='button'
            id={`follow-ups-previously-absent-${group.key}`}
            aria-expanded={showing_previously_absent}
            className='self-start text-sm text-gray-500 underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded'
            onClick={() => setShowingPreviouslyAbsent(!showing_previously_absent)}
          >
            {previously_absent.length} negative {pluralize('finding', previously_absent.length)} previously recorded
          </button>
          {showing_previously_absent && (
            <CheckboxList
              id={`follow-ups-previously-absent-list-${group.key}`}
              items={previously_absent}
              onCheck={(item) => onCheck(asFollowUpSign(item.finding))}
            />
          )}
        </>
      )}
    </div>
  )
}

/*
  Shown as soon as a finding is saved to the record, listing what to check for as a
  result. Not a modal: no backdrop, no focus trap, the page stays usable behind it.

  Portalled into the shared column left of the patient drawer, so that its inputs sit
  outside the workflow's form and are not submitted with the page. That column owns the
  position, width and height cap, and is where the priority escalation panel stacks
  above this one (components/library/layout/side_panels.ts).

  Checking a follow up behaves exactly like checking a warning sign. "None of the above"
  closes the panel at once, leaving a spinner in its place while the negatives save.

  Below md the shared column is the dialog frame. This panel fills that frame,
  unless priority escalation is open above it, in which case it takes the space
  escalation does not (static/styles.css).
*/
export function FollowUpsPanel({ groups, checked_signs, onCheck, onOpenDetails, onNoneOfTheAbove, none_of_the_above_saving, onDismiss }: {
  groups: FollowUpGroup[]
  checked_signs: CheckedWarningSign[]
  none_of_the_above_saving: boolean
  onCheck: OnToggle
  onOpenDetails(sign: CheckedWarningSign): void
  onNoneOfTheAbove(): void
  onDismiss(): void
}) {
  const host = sidePanelHost()
  if (!host) return null

  if (none_of_the_above_saving) {
    return createPortal(
      <div
        id='follow-ups-saving'
        className={cls(
          'pointer-events-auto relative z-10 self-start flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl border border-gray-200 text-sm text-gray-600',
          SIDE_PANEL_ORDER.follow_ups,
        )}
      >
        <Spinner className='text-indigo-700' aria-hidden='true' />
        Saving…
      </div>,
      host,
    )
  }

  if (!groups.length) return null

  return createPortal(
    <>
      <div className={SIDE_PANEL_BACKDROP_CLASS} aria-hidden='true' />
      <div
        id='follow-ups-panel'
        role='dialog'
        aria-labelledby='follow-ups-panel-title'
        className={cls(SIDE_PANEL_CLASS, SIDE_PANEL_ORDER.follow_ups)}
      >
        <div className='shrink-0 flex items-center justify-between px-5 pt-4 pb-3 max-md:relative max-md:justify-center max-md:px-6 max-md:pt-8 max-md:pb-4'>
          <h2 id='follow-ups-panel-title' className='text-lg font-bold text-gray-900 max-md:px-8 max-md:text-center max-md:text-xl max-md:leading-7'>
            Follow ups to check for
          </h2>
          <button
            type='button'
            aria-label='Dismiss follow ups'
            className='rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:absolute max-md:right-3 max-md:top-3'
            onClick={onDismiss}
          >
            <XMarkIcon className='h-5 w-5' />
          </button>
        </div>
        <div className='min-h-0 overflow-y-auto px-5 pb-3 flex flex-col gap-4 max-md:min-w-0 max-md:flex-auto max-md:gap-0 max-md:overflow-x-hidden max-md:px-6 max-md:pb-4 max-md:[&_label]:min-h-12 max-md:[&_label]:items-start max-md:[&_label]:py-2.5 max-md:[&_span]:break-words max-md:[&_input]:size-5'>
          {groups.map((group) => (
            <FollowUpGroupSection
              key={group.key}
              group={group}
              checked_signs={checked_signs}
              onCheck={onCheck}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
        <div className='shrink-0 flex justify-end px-5 pb-4 pt-2 border-t border-gray-100 max-md:px-6 max-md:py-4'>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            id='follow-ups-none-of-the-above'
            className='max-md:h-9 max-md:w-full max-md:text-lg max-md:leading-6'
            onClick={onNoneOfTheAbove}
          >
            None of the above
          </Button>
        </div>
      </div>
    </>,
    host,
  )
}
