import Calendar from './Calendar.tsx'
import { HealthWorkerAppointment } from '../../types.ts'
import Appointment from './Appointment.tsx'

export default function NewCalendar(
  { appointments }: { appointments: HealthWorkerAppointment[] },
) {
  return (
    <div>
      <h2 className='text-base font-semibold leading-6 text-gray-900'>
        Upcoming appointments
      </h2>
      <div className='lg:grid lg:grid-cols-12 lg:gap-x-16'>
        <Calendar>
          <button
            type='button'
            className='mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            Add event
          </button>
        </Calendar>
        <ol className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8'>
          {appointments.map((appointment) => (
            <Appointment appointment={appointment} />
          ))}
        </ol>
      </div>
    </div>
  )
}
