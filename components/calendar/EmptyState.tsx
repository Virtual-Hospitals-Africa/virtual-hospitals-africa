import { MakeAppointmentIcon } from '../library/icons/MakeAppointment.tsx'
import { EmptyState } from '../library/EmptyState.tsx'

export default function CalendarEmptyState() {
  return (
    <EmptyState
      header='No appointments'
      explanation='Create an appointment with a new or existing patient'
      icon={<MakeAppointmentIcon className='mx-auto h-12 w-12 text-gray-400' />}
      button={{
        children: 'New Appointment',
        href: '/app/calendar/appointments/schedule',
      }}
    />
  )
}
