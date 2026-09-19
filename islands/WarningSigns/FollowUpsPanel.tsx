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
    <div className='flex flex-col gap-2'>
      <div className='text-sm leading-5' data-due-to={hyphenate(group.due_to.display)}>
        <span className='font-semibold text-gray-600 mr-1'>Due to</span>
        <span className='text-gray-900'>{group.due_to.display}</span>
      </div>
      {!!checked.length && (
        <div className='flex flex-wrap gap-1' id={`follow-ups-checked-${group.key}`}>
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

  Rendered into document.body so that its inputs sit outside the workflow's form and
  are not submitted with the page. Positioned top right, clear of the patient drawer
  (w-60 xl:w-84) and capped in height so the Next button stays visible.

  Checking a follow up behaves exactly like checking a warning sign. "None of the above"
  closes the panel at once, leaving a spinner in its place while the negatives save.
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
  if (typeof document === 'undefined') return null

  if (none_of_the_above_saving) {
    return createPortal(
      <div
        id='follow-ups-saving'
        className='fixed top-20 right-64 xl:right-88 z-40 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl border border-gray-200 text-sm text-gray-600'
      >
        <Spinner className='text-indigo-700' aria-hidden='true' />
        Saving…
      </div>,
      document.body,
    )
  }

  if (!groups.length) return null

  return createPortal(
    <div
      id='follow-ups-panel'
      className='fixed top-20 right-64 xl:right-88 z-40 w-[30rem] xl:w-[44rem] max-w-[calc(100vw-20rem)] max-h-[calc(100vh-10rem)] flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200'
    >
      <div className='flex items-center justify-between px-5 pt-4 pb-3'>
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
      <div className='overflow-y-auto px-5 pb-3 flex flex-col gap-4'>
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
      <div className='flex justify-end px-5 pb-4 pt-2 border-t border-gray-100'>
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
    </div>,
    document.body,
  )
}
