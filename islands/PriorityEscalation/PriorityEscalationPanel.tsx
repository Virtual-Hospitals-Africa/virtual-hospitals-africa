import { createPortal } from 'preact/compat'
import { useSignal } from '@preact/signals'
import Avatar from '../../components/library/Avatar.tsx'
import Badge from '../../components/library/Badge.tsx'
import { Button } from '../../components/library/Button.tsx'
import { BuildingOffice2Icon, XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { ChevronDownIcon } from '../../components/library/icons/heroicons/mini.tsx'
import OnlineIndicator from '../../components/library/OnlineIndicator.tsx'
import { Maybe, Priority, RenderedEmployeeWithPresenceAndSeniority, RenderedOrganization } from '../../types.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { ReferPostBody, ReferPostResponse } from '../../shared/refer_post.ts'
import { ReferralRecipients } from '../referral/ReferralRecipients.tsx'
import { SIDE_PANEL_CLASS, SIDE_PANEL_ORDER, sidePanelHost } from '../../components/library/layout/side_panels.ts'
import cls from '../../util/cls.ts'

type PriorityEscalationPanelProps = {
  priority: Maybe<Priority>
  escalation_candidates: RenderedEmployeeWithPresenceAndSeniority[]
  nearest_hospital: RenderedOrganization | null
  refer_route: string
  open: boolean
  onClose(): void
}

type Selection =
  | { type: 'colleague'; health_worker_id: string }
  | { type: 'nearest_hospital'; organization_id: string }

function seniorityLabel(
  candidate: RenderedEmployeeWithPresenceAndSeniority,
) {
  if (candidate.senior_on_duty) return 'Senior On Duty'
  if (candidate.senior_on_staff) return 'Senior On Staff'
  return null
}

function EscalationCandidateRow(
  { candidate }: { candidate: RenderedEmployeeWithPresenceAndSeniority },
) {
  const display = employeeDisplay(candidate)
  const seniority_label = seniorityLabel(candidate)

  return (
    <span className='flex items-center gap-3'>
      <div className='relative'>
        <Avatar
          src={display.avatar_url}
          className='h-14 w-14'
        />
        <OnlineIndicator online={candidate.at_work} />
      </div>
      <span className='flex flex-col text-left'>
        <span className='flex items-center gap-2 font-medium text-gray-900 text-md'>
          {display.display_name}
          {seniority_label && <Badge content={seniority_label} color='purple' round='md' />}
        </span>
        <span className='text-gray-500 text-sm capitalize'>
          {candidate.role}
        </span>
      </span>
    </span>
  )
}

const ACTION_CARD_CLASS =
  'w-full text-left cursor-pointer rounded-lg border-2 border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-indigo-600 hover:ring-2 hover:ring-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600'

const SELECTED_ACTION_CARD_CLASS =
  'w-full text-left cursor-pointer rounded-lg border-2 border-indigo-600 bg-indigo-50 px-4 py-3 shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600'

/*
  Not a modal: appears as a panel just above the follow-ups panel
  (islands/WarningSigns/FollowUpsPanel.tsx), so both can be visible together.

  Both portal into the shared column left of the patient drawer, which owns the
  position and width (components/library/layout/side_panels.ts). That column
  also keeps this panel's inputs outside the workflow's form.
*/
export function PriorityEscalationPanel(
  { priority, open, escalation_candidates, nearest_hospital, refer_route, onClose }: PriorityEscalationPanelProps,
) {
  const selected = useSignal<Selection | null>(null)
  const submitting = useSignal(false)
  const error = useSignal<string | null>(null)
  // Set once a referral has been placed from this panel; the panel then shows
  // that referral's state rather than the escalation options.
  const referral = useSignal<ReferPostResponse | null>(null)

  const host = sidePanelHost()
  if (!host || !open) return null

  const senior_provider = escalation_candidates.find((candidate) => candidate.senior_on_duty) ??
    escalation_candidates.find((candidate) => candidate.senior_on_staff)
  const remaining_candidates = escalation_candidates.filter((candidate) => candidate.employee_id !== senior_provider?.employee_id)

  function isSelected(candidate_selection: Selection) {
    const current = selected.value
    if (!current || current.type !== candidate_selection.type) return false
    if (current.type === 'colleague' && candidate_selection.type === 'colleague') {
      return current.health_worker_id === candidate_selection.health_worker_id
    }
    if (current.type === 'nearest_hospital' && candidate_selection.type === 'nearest_hospital') {
      return current.organization_id === candidate_selection.organization_id
    }
    return false
  }

  function handleClose() {
    selected.value = null
    error.value = null
    onClose()
  }

  function handleRefer() {
    const current = selected.value
    if (!current) return

    const to_post: ReferPostBody = current.type === 'colleague'
      ? { type: 'colleague', health_worker_ids_to_be_notified: [current.health_worker_id] }
      : { type: 'nearest_hospital', organization_id: current.organization_id }

    submitting.value = true
    error.value = null

    fetch(refer_route, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(to_post),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`refer responded ${response.status}: ${await response.text()}`)
        referral.value = await response.json()
        selected.value = null
      })
      .catch((err) => {
        console.error(err)
        error.value = 'Something went wrong referring this patient. Please try again.'
      })
      .finally(() => {
        submitting.value = false
      })
  }

  return createPortal(
    <div
      id='priority-escalation-panel'
      className={cls(SIDE_PANEL_CLASS, 'shrink-0', SIDE_PANEL_ORDER.priority_escalation)}
    >
      <div className='shrink-0 flex items-center justify-between px-5 pt-4 pb-3'>
        <h2 className='text-lg font-bold text-gray-900'>Priority Escalation</h2>
        <button
          type='button'
          aria-label='Dismiss priority escalation'
          className='rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          onClick={handleClose}
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      </div>
      <div className='min-h-0 overflow-y-auto px-5 pb-3 flex flex-col gap-4'>
        <div className='text-sm text-gray-900'>
          Priority: {priority}
        </div>
        {referral.value
          ? (
            <div className='flex flex-col gap-3'>
              <span className='font-semibold text-gray-900'>
                Referral status
              </span>
              <ReferralRecipients
                referral_id={referral.value.referral_id}
                recipients={referral.value.recipients}
              />
            </div>
          )
          : (
            <>
              {senior_provider && (
                <button
                  type='button'
                  className={isSelected({ type: 'colleague', health_worker_id: senior_provider.id }) ? SELECTED_ACTION_CARD_CLASS : ACTION_CARD_CLASS}
                  onClick={() => selected.value = { type: 'colleague', health_worker_id: senior_provider.id }}
                >
                  <span className='flex flex-col gap-3'>
                    <span className='font-semibold text-gray-900'>
                      Senior Health Care Professional
                    </span>
                    <EscalationCandidateRow candidate={senior_provider} />
                  </span>
                </button>
              )}
              {nearest_hospital && (
                <button
                  type='button'
                  className={isSelected({ type: 'nearest_hospital', organization_id: nearest_hospital.id }) ? SELECTED_ACTION_CARD_CLASS : ACTION_CARD_CLASS}
                  onClick={() => selected.value = { type: 'nearest_hospital', organization_id: nearest_hospital.id }}
                >
                  <span className='flex items-center gap-3'>
                    <BuildingOffice2Icon className='h-8 w-8 text-indigo-600' />
                    <span className='flex flex-col text-left'>
                      <span className='font-semibold text-gray-900'>
                        Nearest Hospital
                      </span>
                      <span className='text-sm text-gray-900'>
                        {nearest_hospital.name}
                      </span>
                      {nearest_hospital.formatted_address && (
                        <span className='text-sm text-gray-500'>
                          {nearest_hospital.formatted_address}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              )}
              {!!remaining_candidates.length && (
                <details className='group rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm'>
                  <summary className='flex items-center gap-1.5 py-1 cursor-pointer text-sm font-medium text-gray-900 list-none [&::-webkit-details-marker]:hidden'>
                    <ChevronDownIcon className='w-4 h-4 transition-transform group-open:rotate-180' />
                    More people at this facility
                  </summary>
                  <div className='flex flex-col gap-2 pt-3'>
                    {remaining_candidates.map((candidate) => (
                      <button
                        key={candidate.employee_id}
                        type='button'
                        className={isSelected({ type: 'colleague', health_worker_id: candidate.id }) ? SELECTED_ACTION_CARD_CLASS : ACTION_CARD_CLASS}
                        onClick={() => selected.value = { type: 'colleague', health_worker_id: candidate.id }}
                      >
                        <EscalationCandidateRow candidate={candidate} />
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        {error.value && (
          <div className='text-sm text-red-600'>
            {error.value}
          </div>
        )}
      </div>
      <div className='shrink-0 flex gap-3 justify-end px-5 pb-4 pt-2 border-t border-gray-100'>
        <Button
          variant='tertiary'
          type='button'
          onClick={handleClose}
        >
          Close
        </Button>
        {!referral.value && (
          <Button
            variant='primary'
            type='button'
            disabled={!selected.value || submitting.value}
            onClick={handleRefer}
          >
            Refer
          </Button>
        )}
      </div>
    </div>,
    host,
  )
}
