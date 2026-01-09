import { LocalTime } from '../../islands/LocalTime.tsx'
import { organizationOf } from '../../shared/employees.ts'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import generateUUID from '../../util/uuid.ts'
import { Button } from './Button.tsx'
import {
  BuildingOffice2Icon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  // XMarkIcon,
} from './icons/heroicons/outline.tsx'

export function FindingPanel(
  { finding, organization_id }: {
    finding:
      | RenderedFindingRelativeToHealthWorker
      | RenderedFindingRelativeToHealthWorker
    organization_id: string
  },
) {
  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 w-74'>
      <div className='flex flex-col gap-2'>
        {/* Title with close button */}
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold leading-6 text-red-800'>
              {finding.displays.full}
            </h3>
          </div>
          {
            /* <div className='flex gap-2'>
            <button type='button' className='p-1 rounded-full'>
              <XMarkIcon className='w-3 h-3 text-gray-400' />
            </button>
          </div> */
          }
        </div>

        {/* Details section */}
        <div className='flex flex-col gap-2'>
          {
            /* Duration
          {duration_text && (
            <div className='flex items-center gap-1'>
              <p className='text-sm text-gray-600'>Duration:</p>
              <p className='text-sm font-medium text-gray-900'>
                {duration_text}
              </p>
            </div>
          )} */
          }

          {/* <hr className='border-gray-200' /> */}

          {/* Provider info */}
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-gray-600'>Recorded by:</p>

            {/* Provider name */}
            <div className='flex gap-1.5 items-center'>
              <UserIcon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                {employeeDisplay(finding.provider).display_name}
              </p>
            </div>

            {/* Procedure context */}
            {finding.as_part_of_procedure && (
              <div className='flex gap-1.5 items-center'>
                <div className='w-4 h-4'>
                  <svg
                    className='w-full h-full text-indigo-700'
                    viewBox='0 0 16 16'
                    fill='currentColor'
                  >
                    <path d='M8 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11A.5.5 0 0 1 8 2z' />
                    <path d='M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8z' />
                  </svg>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  during{' '}
                  {finding.as_part_of_procedure.specific_snomed_concept.name}
                </p>
              </div>
            )}

            {/* Organization */}
            <div className='flex gap-1.5 items-center'>
              <BuildingOffice2Icon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                at {organizationOf(finding.provider).name}
              </p>
            </div>

            {/* Date */}
            <div className='flex gap-1.5 items-center'>
              <CalendarIcon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                <LocalTime
                  timestamp={finding.created_at}
                  expected_time_range='past'
                />
              </p>
            </div>

            {/* Message */}
            {!finding.provider.is_me && (
              <Button
                variant='secondary'
                href={`/app/organizations/${organization_id}/messaging/drafts/${generateUUID()}?targets.employee.${finding.provider.employee_id}=true`}
                left_icon={
                  <ChatBubbleLeftIcon className='w-4 h-4 text-indigo-700' />
                }
              >
                Message
              </Button>
            )}
          </div>

          {/* Notes section */}
          {
            /* {(finding.notes || []).length > 0 && (
            <>
              <hr className='border-gray-200' />
              <div className='flex flex-col gap-1'>
                {finding.notes!.map((note, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col gap-2 p-2 bg-gray-200 rounded'
                  >
                    <p className='text-sm leading-5 text-gray-900'>
                      {note.note}
                    </p>
                    <p className='text-xs leading-4 text-gray-600 truncate'>
                      <LocalTime
                        timestamp={note.created_at}
                        expected_time_range='past'
                      />
                    </p>
                  </div>
                ))}
              </div>
            </>
          )} */
          }

          {/* TODO: switch this to a referent findings section */}
          {/* Qualifiers section */}
          {finding.attributes.length > 0 && (
            <>
              <hr className='border-gray-200' />
              <div className='flex flex-col gap-1'>
                {finding.attributes.map((attribute, idx) => (
                  <div key={idx} className='flex items-center gap-1'>
                    <span className='text-sm text-gray-600'>
                      {attribute.displays.finding}:
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {attribute.displays.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {finding.evaluations.length > 0 && (
            <>
              <hr className='border-gray-200' />
              <div className='flex flex-col gap-1'>
                {finding.evaluations.map((evaluation) => (
                  <p
                    key={evaluation.record_id}
                    className='text-sm text-gray-600'
                  >
                    <span className='text-sm text-gray-600'>
                      {evaluation.displays.finding}:
                    </span>
                    &nbsp;
                    <span className='text-sm font-medium text-gray-900'>
                      {evaluation.displays.value}
                    </span>
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
