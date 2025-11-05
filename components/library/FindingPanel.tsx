import { LocalTime } from '../../islands/LocalTime.tsx'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import healthWorkerDisplay from '../../util/healthWorkerDisplay.ts'
import {
  BuildingOffice2Icon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
} from './icons/heroicons/outline.tsx'

export function FindingPanel(
  { finding }: { finding: RenderedFindingRelativeToHealthWorker },
) {
  const duration_text = calculateDuration(finding.created_at)

  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 w-full max-w-[296px]'>
      <div className='flex flex-col gap-2'>
        {/* Title with close button */}
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold leading-6 text-red-800'>
              {finding.name}
            </h3>
          </div>
          <div className='flex gap-2'>
            <button type='button' className='p-1 rounded-full'>
              <XMarkIcon className='w-3 h-3 text-gray-400' />
            </button>
          </div>
        </div>

        {/* Details section */}
        <div className='flex flex-col gap-2'>
          {/* Duration */}
          {duration_text && (
            <div className='flex items-center gap-1'>
              <p className='text-sm text-gray-600'>Duration:</p>
              <p className='text-sm font-medium text-gray-900'>
                {duration_text}
              </p>
            </div>
          )}

          <hr className='border-gray-200' />

          {/* Provider info */}
          <div className='flex flex-col gap-1'>
            <p className='text-xs text-gray-600'>Recorded by:</p>

            {/* Provider name */}
            <div className='flex gap-1.5 items-center'>
              <UserIcon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                {healthWorkerDisplay(finding.provider).display_name}
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
                  During {finding.as_part_of_procedure.name}
                </p>
              </div>
            )}

            {/* Organization */}
            <div className='flex gap-1.5 items-center'>
              <BuildingOffice2Icon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                {finding.provider.organization_name}
              </p>
            </div>

            {/* Date */}
            <div className='flex gap-1.5 items-center'>
              <CalendarIcon className='w-4 h-4 text-indigo-700' />
              <p className='text-sm font-medium text-gray-900'>
                <LocalTime timestamp={finding.created_at} />
              </p>
            </div>
          </div>

          {/* Notes section */}
          {(finding.notes || []).length > 0 && (
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
                      <LocalTime timestamp={note.created_at} />
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Qualifiers section */}
          {finding.qualifiers.length > 0 && (
            <>
              <hr className='border-gray-200' />
              <div className='flex flex-col gap-1'>
                {finding.qualifiers.map((qualifier, idx) => (
                  <div key={idx} className='flex items-center gap-1'>
                    {qualifier.value_display
                      ? (
                        <>
                          <p className='text-sm text-gray-600'>
                            {qualifier.name}:
                          </p>
                          <p className='text-sm font-medium text-gray-900'>
                            {qualifier.value_display}
                          </p>
                        </>
                      )
                      : (
                        <p className='text-sm text-gray-600'>
                          {qualifier.name}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function calculateDuration(created_at: Date): string | null {
  const now = new Date()
  const created = new Date(created_at)
  const diffMs = now.getTime() - created.getTime()
  const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))

  if (diffYears > 0) {
    return `${diffYears} year${diffYears === 1 ? '' : 's'}`
  }

  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'}`
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`
  }

  return null
}
