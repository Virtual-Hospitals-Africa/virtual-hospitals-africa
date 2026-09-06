import { createPortal } from 'preact/compat'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { YesNoGrid, YesNoQuestion } from '../form/inputs/yes_no.tsx'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { findingFullDisplay } from '../../shared/patient_records.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import cls from '../../util/cls.ts'
import { FollowUpGroup } from './follow_ups.ts'

/*
  Shown as soon as a finding is saved to the record, listing what to check for as a
  result. Not a modal: no backdrop, no focus trap, the page stays usable behind it.

  Rendered into document.body so that its radio inputs sit outside the workflow's
  form and are not submitted with the page. Positioned top right, clear of the
  patient drawer (w-60 xl:w-84) and capped in height so the Next button stays visible.

  TODO save these check_for findings. For now they are display only.
*/
export function FollowUpsPanel({ groups, onDismiss }: {
  groups: FollowUpGroup[]
  onDismiss(): void
}) {
  if (!groups.length || typeof document === 'undefined') return null

  return createPortal(
    <div
      id='follow-ups-panel'
      className='fixed top-20 right-64 xl:right-88 z-40 w-[30rem] max-w-[calc(100vw-20rem)] max-h-[calc(100vh-10rem)] flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200'
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
      <div className='overflow-y-auto px-5 pb-5'>
        <YesNoGrid title='Check for' id='follow-ups-check-for'>
          {groups.map((group, index) => (
            <>
              <div
                key={group.key}
                className={cls('col-span-4 pl-4 text-sm leading-5', {
                  'pt-1': index === 0,
                  'pt-5': index > 0,
                })}
                data-due-to={hyphenate(group.due_to.display)}
              >
                <span className='font-semibold text-gray-600'>
                  {'Due to '}
                </span>
                <span className='text-gray-900'>{group.due_to.display}</span>
              </div>
              {group.findings_to_check_for.map((finding) => {
                const display = findingFullDisplay(parseSExpressionAsInsertableFinding(finding.s_expression))
                return (
                  <YesNoQuestion
                    key={finding.s_expression}
                    name={`follow_ups.${group.key}.${hyphenate(display)}`}
                    label={display}
                    value={finding.existing_record?.existence}
                  />
                )
              })}
            </>
          ))}
        </YesNoGrid>
      </div>
    </div>,
    document.body,
  )
}
