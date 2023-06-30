import { HealthWorkerAppointment } from '../../types.ts'
import AppointmentsEmptyState from './EmptyState.tsx'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import Appointment from './Appointment.tsx'

const className =
  'mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'

export default function Appointments(
  { headerText, appointments, route }: {
    headerText: string
    appointments: HealthWorkerAppointment[]
    route: string
  },
) {
  const header = <SectionHeader>{headerText}</SectionHeader>

  if (!appointments.length) {
    return (
      <div className={className}>
        {header}
        <AppointmentsEmptyState />
      </div>
    )
  }

  return (
    <ol className={className}>
      {header}
      {appointments.map((appointment) => (
        <Appointment
          appointment={appointment}
          route={route}
          key={appointment.id}
        />
      ))}
    </ol>
  )
}
