import type { RenderableAppointment } from '../../types.ts'
import AppointmentsEmptyState from './EmptyState.tsx'
import SectionHeader from '../library/typography/SectionHeader.tsx'
import Appointment from './Appointment.tsx'
import cls from '../../util/cls.ts'

export default function Appointments(
  { headerText, patient_id, appointments, url, className }: {
    headerText: string
    patient_id: string
    appointments: RenderableAppointment[]
    url: URL
    className?: string
  },
) {
  const useClassName = cls(
    'divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full',
    className,
  )
  const header = <SectionHeader>{headerText}</SectionHeader>

  if (!appointments.length) {
    return (
      <div className={useClassName}>
        {header}
        <AppointmentsEmptyState patient_id={patient_id}/>
      </div>
    )
  }

  return (
    <ol className={useClassName}>
      {header}
      {appointments.map((appointment) => (
        <Appointment
          appointment={appointment}
          url={url}
          key={appointment.id}
        />
      ))}
    </ol>
  )
}
