import { useState } from 'preact/hooks'
import { CheckboxList } from '../../components/library/CheckboxList.tsx'
import { FindingToCheckFor, FollowUpGroup, RecordedFinding } from '../../types.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { pluralize } from '../../util/pluralize.ts'
import { SelectedChip } from '../SelectedRecordChip.tsx'
import { findRecordedFollowUp, followUpDisplay } from './follow_ups.ts'

type Item = {
  id: string
  label: string
  checked: boolean
  previously_absent: boolean
  finding: FindingToCheckFor
  recorded?: RecordedFinding
}

function asItem(group: FollowUpGroup, recorded: RecordedFinding[], finding: FindingToCheckFor): Item {
  const recorded_finding = findRecordedFollowUp(recorded, finding)
  const display = followUpDisplay(finding.s_expression)
  return {
    id: `follow-up.${group.key}.${hyphenate(display)}`,
    label: display,
    checked: !!recorded_finding,
    previously_absent: !recorded_finding && finding.existing_record?.existence === 'No',
    finding,
    recorded: recorded_finding,
  }
}

export type OnCheckFollowUp = (finding: FindingToCheckFor) => void
export type OnOpenFollowUpDetails = (finding: FindingToCheckFor, recorded: RecordedFinding) => void

/*
  The follow ups for one group: what is still to check for as checkboxes, what has been
  checked as record pills like those atop the warning signs page, and whatever was already
  recorded as absent rolled up behind a count so the still-open questions are what the eye
  lands on. Shown in the follow ups panel, and in the body of the additional tasks page for
  the check_for tasks present when it loaded.
*/
export function FollowUpGroupSection({ group, recorded, is_follow_up, onCheck, onOpenDetails }: {
  group: FollowUpGroup
  recorded: RecordedFinding[]
  // Raised by findings submitted from the page the group is shown on (see AdditionalTasks)
  is_follow_up?: boolean
  onCheck: OnCheckFollowUp
  onOpenDetails: OnOpenFollowUpDetails
}) {
  const [showing_previously_absent, setShowingPreviouslyAbsent] = useState(false)

  const items = group.findings_to_check_for.map((finding) => asItem(group, recorded, finding))
  const checked = items.filter((item) => item.checked)
  const to_check = items.filter((item) => !item.checked && !item.previously_absent)
  const previously_absent = items.filter((item) => item.previously_absent)

  return (
    <div className='follow-up-group flex flex-col gap-2' data-follow-up-group={group.key}>
      {is_follow_up && (
        <span className='inline-flex py-0.5 text-xs font-medium text-indigo-800'>
          * Follow up based on new findings
        </span>
      )}
      <div className='text-sm leading-5' data-due-to={hyphenate(group.due_to.display)}>
        <span className='font-semibold text-gray-600 mr-1'>Due to</span>
        <span className='text-gray-900'>{group.due_to.display}</span>
      </div>
      {!!checked.length && (
        <div className='flex flex-wrap gap-1' id={`follow-ups-checked-${group.key}`}>
          {checked.map((item) => (
            <SelectedChip
              key={item.recorded!.record_id}
              item={item.recorded!}
              click_action='edit'
              onClick={() => onOpenDetails(item.finding, item.recorded!)}
            />
          ))}
        </div>
      )}
      {!!to_check.length && (
        <CheckboxList
          id={`follow-ups-${group.key}`}
          items={to_check}
          onCheck={(item) => onCheck(item.finding)}
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
              onCheck={(item) => onCheck(item.finding)}
            />
          )}
        </>
      )}
    </div>
  )
}
