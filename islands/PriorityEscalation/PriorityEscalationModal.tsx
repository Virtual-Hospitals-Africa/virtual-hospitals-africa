import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'preact'
import Avatar from '../../components/library/Avatar.tsx'
import Badge from '../../components/library/Badge.tsx'
import { Button } from '../../components/library/Button.tsx'
import { BuildingOffice2Icon, XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { ChevronDownIcon } from '../../components/library/icons/heroicons/mini.tsx'
import OnlineIndicator from '../../components/library/OnlineIndicator.tsx'
import { RenderedEmployeeWithPresenceAndSeniority, RenderedOrganization } from '../../types.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import type { PriorityEscalation } from './PriorityEscalationListener.tsx'

type PriorityEscalationModalProps = {
  escalation: PriorityEscalation | null
  escalation_candidates: RenderedEmployeeWithPresenceAndSeniority[]
  nearest_hospital: RenderedOrganization | null
  onClose(): void
}

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
  'w-full text-left cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-indigo-600 hover:ring-2 hover:ring-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600'

const SENIOR_ACTION_CARD_CLASS =
  'w-full text-left cursor-pointer rounded-lg border-2 border-indigo-600 bg-indigo-50 px-4 py-4 shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600'

export function PriorityEscalationModal(
  { escalation, escalation_candidates, nearest_hospital, onClose }: PriorityEscalationModalProps,
) {
  const senior_provider = escalation_candidates.find((candidate) => candidate.senior_on_duty) ??
    escalation_candidates.find((candidate) => candidate.senior_on_staff)
  const remaining_candidates = escalation_candidates.filter((candidate) => candidate.employee_id !== senior_provider?.employee_id)

  return (
    <Transition.Root show={escalation !== null} as={Fragment}>
      <Dialog className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all'>
                {escalation && (
                  <div className='flex flex-col max-h-[90vh]'>
                    <div className='relative px-6 pt-8 pb-4 text-center'>
                      <button
                        type='button'
                        className='absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        onClick={onClose}
                      >
                        <XMarkIcon className='h-5 w-5' />
                      </button>
                      <Dialog.Title className='text-xl font-bold text-gray-900'>
                        Priority Escalation
                      </Dialog.Title>
                    </div>
                    <div className='overflow-y-auto flex-1 px-6 pb-4 flex flex-col gap-5'>
                      <div>
                        Priority: {escalation.priority}
                      </div>
                      <button
                        type='button'
                        className={SENIOR_ACTION_CARD_CLASS}
                        onClick={() => {
                          console.log(
                            'Senior Health Care Professional',
                            senior_provider,
                          )
                        }}
                      >
                        <span className='flex flex-col gap-3'>
                          <span className='font-semibold text-gray-900'>
                            Senior Health Care Professional
                          </span>
                          {senior_provider && (
                            <EscalationCandidateRow
                              candidate={senior_provider}
                            />
                          )}
                        </span>
                      </button>
                      <button
                        type='button'
                        className={ACTION_CARD_CLASS}
                        onClick={() => {
                          console.log('Nearest Hospital')
                        }}
                      >
                        <span className='flex items-center gap-3'>
                          <BuildingOffice2Icon className='h-8 w-8 text-indigo-600' />
                          <span className='flex flex-col text-left'>
                            <span className='font-semibold text-gray-900'>
                              Nearest Hospital
                            </span>
                            {nearest_hospital && (
                              <>
                                <span className='text-sm text-gray-900'>
                                  {nearest_hospital.name}
                                </span>
                                {nearest_hospital.formatted_address && (
                                  <span className='text-sm text-gray-500'>
                                    {nearest_hospital.formatted_address}
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                        </span>
                      </button>
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
                                className={ACTION_CARD_CLASS}
                                onClick={() => {
                                  console.log(
                                    'More people at this facility',
                                    candidate,
                                  )
                                }}
                              >
                                <EscalationCandidateRow candidate={candidate} />
                              </button>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                    <div className='flex gap-3 border-t border-gray-100 px-6 py-4'>
                      <Button
                        variant='tertiary'
                        className='flex-1'
                        type='button'
                        onClick={onClose}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
