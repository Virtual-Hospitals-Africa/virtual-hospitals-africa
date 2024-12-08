import { MakeAppointmentIcon } from '../library/icons/MakeAppointment.tsx'
import { EmptyState } from '../library/EmptyState.tsx'

export default function CalendarEmptyState(
  { patient_id }: { patient_id: string | undefined },
) {
  let search
  if (patient_id) {
    search = new URLSearchParams({ patient_id }).toString()
  }

  return (
    <EmptyState
      header='No appointments'
      explanation='Create an appointment with a new or existing patient'
      icon={<MakeAppointmentIcon className='mx-auto h-12 w-12 text-gray-400' />}
      button={{
        children: 'New Appointment',
        href: search
          ? `/app/calendar/appointments/schedule?${search}`
          : '/app/calendar/appointments/schedule',
      }}
    />
  )
}
