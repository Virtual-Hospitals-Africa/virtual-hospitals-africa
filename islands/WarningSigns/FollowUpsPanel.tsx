import { createPortal } from 'preact/compat'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Button } from '../../components/library/Button.tsx'
import { CheckboxList } from '../../components/library/CheckboxList.tsx'
import { FindingToCheckFor } from '../../types.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import cls from '../../util/cls.ts'
import { asFollowUpSign, findCheckedFollowUp, followUpDisplay, FollowUpGroup, isUnanswered } from './follow_ups.ts'
import { CheckedWarningSign, OnToggle } from './shared.ts'

/*
  Shown as soon as a finding is saved to the record, listing what to check for as a
  result. Not a modal: no backdrop, no focus trap, the page stays usable behind it.

  Rendered into document.body so that its inputs sit outside the workflow's form and
  are not submitted with the page. Positioned top right, clear of the patient drawer
  (w-60 xl:w-84) and capped in height so the Next button stays visible.

  Checking a follow up behaves exactly like checking a warning sign. "None of the above"
  records every follow up still unanswered as absent and closes the panel.
*/
export function FollowUpsPanel({ groups, checked_signs, onCheck, onOpenDetails, onNoneOfTheAbove, none_of_the_above_saving, onDismiss }: {
  groups: FollowUpGroup[]
  checked_signs: CheckedWarningSign[]
  onCheck: OnToggle
  onOpenDetails(sign: CheckedWarningSign): void
  onNoneOfTheAbove: null | (() => void)
  none_of_the_above_saving: boolean
  onDismiss(): void
}) {
  if (!groups.length || typeof document === 'undefined') return null

  const any_unanswered = groups.some((group) => group.findings_to_check_for.some((finding) => isUnanswered(checked_signs, finding)))

  type Item = { id: string; label: string; description: string | null; checked: boolean; finding: FindingToCheckFor; checked_sign?: CheckedWarningSign }

  function asItem(group: FollowUpGroup, finding: FindingToCheckFor): Item {
    const checked_sign = findCheckedFollowUp(checked_signs, finding)
    const display = followUpDisplay(finding.s_expression)
    const recorded_absent = !checked_sign && finding.existing_record?.existence === 'No'
    return {
      id: `follow-up.${group.key}.${hyphenate(display)}`,
      label: display,
      description: recorded_absent ? 'Previously recorded as absent' : null,
      checked: !!checked_sign,
      finding,
      checked_sign,
    }
  }

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
          <CheckboxList
            key={group.key}
            id={`follow-ups-${group.key}`}
            items={group.findings_to_check_for.map((finding) => asItem(group, finding))}
            onCheck={(item) => onCheck(asFollowUpSign(item.finding))}
            onOpenChecked={(item) => item.checked_sign && onOpenDetails(item.checked_sign)}
          >
            <div className='text-sm leading-5' data-due-to={hyphenate(group.due_to.display)}>
              <span className='font-semibold text-gray-600 mr-1'>Due to</span>
              <span className='text-gray-900'>{group.due_to.display}</span>
            </div>
          </CheckboxList>
        ))}
      </div>
      {onNoneOfTheAbove && (
        <div className={cls('flex justify-end px-5 pb-4 pt-2 border-t border-gray-100', { 'opacity-60': none_of_the_above_saving })}>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            id='follow-ups-none-of-the-above'
            disabled={!any_unanswered || none_of_the_above_saving}
            onClick={onNoneOfTheAbove}
          >
            {none_of_the_above_saving ? 'Saving…' : 'None of the above'}
          </Button>
        </div>
      )}
    </div>,
    document.body,
  )
}
