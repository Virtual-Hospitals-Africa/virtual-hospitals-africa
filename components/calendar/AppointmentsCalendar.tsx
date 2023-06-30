import Calendar from './Calendar.tsx'
import { CalendarPageProps } from '../../types.ts'
import Card from '../library/Card.tsx'
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
  { appointments, day, today, route }: CalendarPageProps & { route: string },
) {
  return (
    <Card className='w-full'>
      <div className='lg:grid lg:grid-cols-12 lg:gap-x-16 w-full'>
        <Calendar day={day} today={today} route={route}>
          <Button
            className='mt-8 w-full'
            href={`${route}/appointments/schedule`}
          >
            Schedule Appointment
          </Button>
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
