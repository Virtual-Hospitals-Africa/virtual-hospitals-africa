import Calendar from './Calendar.tsx'
import { CalendarPageProps } from '../../types.ts'
import Card from '../library/Card.tsx'
import Appointments from './Appointments.tsx'
import { prettyMinimal } from '../../util/date.ts'

function formHeaderText({ day, today }: { day: string; today: string }) {
  if (today === day) return 'Today’s Appointments'
  const dayStrMinimal = prettyMinimal(day, today)
  if (dayStrMinimal === 'Tomorrow') return 'Tomorrow’s Appointments'
  return `Appointments on ${dayStrMinimal}`
}

export default function AppointmentsCalendar(
  { appointments, day, today, route }: CalendarPageProps & { route: string },
) {
  return (
    <Card className='w-full'>
      <div className='lg:grid lg:grid-cols-12 lg:gap-x-16 w-full'>
        <Calendar day={day} today={today} route={route}>
          <a
            type='button'
            className='mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            href={`${route}/schedule-appointment`}
          >
            Schedule Appointment
          </a>
        </Calendar>
        <Appointments
          headerText={formHeaderText({ day, today })}
          appointments={appointments}
          route={route}
        />
      </div>
    </Card>
  )
}
