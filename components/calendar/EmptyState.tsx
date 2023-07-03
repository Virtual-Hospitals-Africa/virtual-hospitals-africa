import MakeAppointmentIcon from '../library/icons/make-appointment.tsx'
import EmptyState from '../library/EmptyState.tsx'

export default function CalendarEmptyState() {
  return (
    <EmptyState
      header='No appointments'
      explanation='Create an appointment with a new or existing patient'
      buttonText='New Appointment'
      icon={<MakeAppointmentIcon className='mx-auto h-12 w-12 text-gray-400' />}
      href='/app/calendar/appointments/schedule'
    />
  )
}
