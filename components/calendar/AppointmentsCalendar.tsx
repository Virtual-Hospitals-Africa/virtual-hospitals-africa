import Calendar from './Calendar.tsx'
import { CalendarPageProps } from '../../types.ts'
import Appointments from './Appointments.tsx'
import { prettyMinimal } from '../../util/date.ts'
import { Button } from '../library/Button.tsx'

function formHeaderText({ day, today }: { day: string; today: string }) {
  if (today === day) return 'Today’s Appointments'
  const dayStrMinimal = prettyMinimal(day, today)
  if (dayStrMinimal === 'Tomorrow') return 'Tomorrow’s Appointments'
  return `Appointments on ${dayStrMinimal}`
}

export default function AppointmentsCalendar(
  { appointments, day, today, url }: CalendarPageProps & { url: URL },
) {
  return (
    <div className='lg:grid lg:grid-cols-12 lg:gap-x-16 w-full'>
      <Calendar day={day} today={today} url={url}>
        <Button
          className='mt-8 w-full'
          href={`${url.pathname}/appointments/schedule`}
        >
          Schedule Appointment
        </Button>
        <Button
          className='mt-2 w-full'
          href={`${url.pathname}/availability`}
        >
          Set Availability
        </Button>
      </Calendar>
      <Appointments
        headerText={formHeaderText({ day, today })}
        appointments={appointments}
        url={url}
      />
    </div>
  )
}
