import { MapPinIcon } from '../library/icons/heroicons/solid.tsx'
import cls from '../../util/cls.ts'

type AvailabilityStatus = 'available_soon' | 'busy' | 'unavailable'

type StaffMember = {
  name: string
  role: string
  activity: string
  location: string
  estimated_minutes: number
  status: AvailabilityStatus
}

const statusStyles: Record<
  AvailabilityStatus,
  { border: string; chipBg: string; chipText: string }
> = {
  available_soon: {
    border: 'border-l-green-500',
    chipBg: 'bg-green-100',
    chipText: 'text-green-800',
  },
  busy: {
    border: 'border-l-yellow-400',
    chipBg: 'bg-yellow-100',
    chipText: 'text-yellow-800',
  },
  unavailable: {
    border: 'border-l-red-600',
    chipBg: 'bg-red-100',
    chipText: 'text-red-800',
  },
}

function StaffStatusCard({ staff }: { staff: StaffMember }) {
  const styles = statusStyles[staff.status]

  return (
    <div
      className={cls(
        'bg-gray-50 border-l-4 rounded py-4 pl-6 pr-4 w-full',
        styles.border,
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1.5'>
          <div>
            <p className='text-base font-semibold leading-snug text-gray-900'>
              {staff.name}
            </p>
            <p className='text-sm font-normal leading-5 text-gray-600'>
              {staff.role}
            </p>
          </div>
          <div className='flex flex-col gap-0.5'>
            <p className='text-sm font-medium leading-5 text-gray-600'>
              {staff.activity}
            </p>
            <div className='flex items-center gap-1.5'>
              <MapPinIcon className='size-5 text-gray-500 shrink-0' />
              <p className='text-sm font-normal leading-5 text-gray-500'>
                {staff.location}
              </p>
            </div>
          </div>
        </div>
        <div
          className={cls(
            'px-4 py-0.5 rounded-full text-sm font-medium leading-5 whitespace-nowrap',
            styles.chipBg,
            styles.chipText,
          )}
        >
          ~{staff.estimated_minutes} min
        </div>
      </div>
    </div>
  )
}

export default function StaffAvailabilityColumn(
  { staff }: { staff: Array<StaffMember> },
) {
  return (
    <div className='flex flex-col gap-4 shrink-0'>
      <h3 className='text-lg font-semibold leading-6 text-gray-600'>
        Staff Availability
      </h3>
      <div className='flex flex-col gap-6'>
        {staff.map((member) => (
          <StaffStatusCard key={member.name} staff={member} />
        ))}
      </div>
    </div>
  )
}
