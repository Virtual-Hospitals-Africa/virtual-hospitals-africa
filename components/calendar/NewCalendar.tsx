import Calendar from './Calendar.tsx'
import { CalendarPageProps } from '../../types.ts'
import Appointment from './Appointment.tsx'
import Card from '../library/Card.tsx'

export default function NewCalendar(
  { appointments, day, today, route }: CalendarPageProps & { route: string },
) {
  const headerText = today === day
    ? 'Today’s Appointments'
    : `Appointments on ${day}`

  return (
    <Card className='w-full'>
      <div className='lg:grid lg:grid-cols-12 lg:gap-x-16 w-full'>
        <Calendar day={day} today={today}>
          <button
            type='button'
            className='mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            Schedule Appointment
          </button>
        </Calendar>
        {/* <div className='w-full'> */}
        {
          /* */
        }

        <ol className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <h2 className='text-base font-semibold leading-6 text-gray-900'>
            {headerText}
          </h2>
          {appointments.map((appointment) => (
            <Appointment appointment={appointment} route={route} />
          ))}
        </ol>
        {/* </div> */}
      </div>
    </Card>
  )
}
