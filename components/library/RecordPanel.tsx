import { LocalTime } from '../../islands/LocalTime.tsx'
import { organizationOf } from '../../shared/employees.ts'
import { RecordValueLink, RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import generateUUID from '../../util/uuid.ts'
import { Button } from './Button.tsx'
import {
  BuildingOffice2Icon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  CpuChipIcon,
  UserIcon,
  // XMarkIcon,
} from './icons/heroicons/outline.tsx'

type AdditionalContextLineProps = { left: string; right: string | RecordValueLink | null; separator: string }

function AdditionalContextLine({ left, right, separator }: AdditionalContextLineProps) {
  if (right === null) return null

  return (
    <li className='flex flex-col gap-1'>
      <p className='text-sm text-gray-600'>
        <span className='text-sm text-gray-600'>
          {left}
          {separator}
        </span>
        {typeof right === 'string'
          ? <span className='text-sm font-medium text-gray-900'>{right}</span>
          : (
            <a href={right.href} target='_blank' rel='noopener noreferrer' className='text-sm font-medium text-indigo-600 hover:underline'>
              {right.title}
            </a>
          )}
      </p>
    </li>
  )
}

function keyOf(line: AdditionalContextLineProps) {
  const right = line.right === null ? '' : typeof line.right === 'string' ? line.right : line.right.href
  return `${line.left} ${right} ${line.separator}`
}

function AdditionalContext({ context }: { context: AdditionalContextLineProps[] }) {
  if (!context.length) return null
  return (
    <>
      <hr className='border-gray-200' />
      <ul className='flex flex-col gap-1'>
        {context.map((line) => <AdditionalContextLine key={keyOf(line)} {...line} />)}
      </ul>
    </>
  )
}

export function RecordPanel(
  { record, organization_id }: {
    record:
      | RenderedFindingRelativeToHealthWorker
      | RenderedEvaluationRelativeToHealthWorker
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
              {record.displays.full}
            </h3>
          </div>
        </div>

        {/* Details section */}
        <div className='flex flex-col gap-2'>
          {/* Provider info */}
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-gray-600'>{record.type === 'finding' ? 'Recorded' : 'Evaluated'} by:</p>

            {/* Provider name */}
            <div className='flex gap-1.5 items-center'>
              {record.provider
                ? (
                  <>
                    <UserIcon className='w-4 h-4 text-indigo-700' />
                    <p className='text-sm font-medium text-gray-900'>
                      {employeeDisplay(record.provider).display_name}
                    </p>
                  </>
                )
                : (
                  <>
                    <CpuChipIcon className='w-4 h-4 text-indigo-700' />
                    <p className='text-sm font-medium text-gray-900'>
                      System
                    </p>
                  </>
                )}
            </div>

            {/* Procedure context */}
            {record.as_part_of_procedure && (
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
                  during {record.as_part_of_procedure.specific_snomed_concept_name}
                </p>
              </div>
            )}

            {/* Organization */}
            {record.provider && (
              <div className='flex gap-1.5 items-center'>
                <BuildingOffice2Icon className='w-4 h-4 text-indigo-700' />
                <p className='text-sm font-medium text-gray-900'>
                  at {organizationOf(record.provider).name}
                </p>
              </div>
            )}

            {/* Date */}
            <div className='flex gap-1.5 items-center'>
              <CalendarIcon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                <LocalTime
                  timestamp={record.created_at}
                  expected_time_range='past'
                />
              </p>
            </div>

            {/* Message */}
            {record.provider && !record.provider.is_me && (
              <Button
                variant='secondary'
                href={`/app/organizations/${organization_id}/messaging/drafts/${generateUUID()}?targets.employee.${record.provider.employee_id}=true`}
                left_icon={<ChatBubbleLeftIcon className='w-4 h-4 text-indigo-700' />}
              >
                Message
              </Button>
            )}
          </div>
          <AdditionalContext
            context={[
              ...(record.priority ? [{ left: 'Priority', right: record.priority, separator: ': ' }] : []),
              ...record.attributes.map((attribute) => ({
                left: attribute.displays.finding,
                right: attribute.displays.value,
                separator: ': ',
              })),
              ...record.evaluations.map((evaluation) => ({
                left: evaluation.displays.finding,
                right: evaluation.displays.value,
                separator: ': ',
              })),
              ...record.destination_relations.map((destination_relation) => ({
                left: destination_relation.displays.full,
                right: destination_relation.relation_name,
                separator: ' → ',
              })),
            ]}
          />
        </div>
      </div>
    </div>
  )
}
