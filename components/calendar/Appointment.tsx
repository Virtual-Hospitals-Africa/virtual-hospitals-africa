import { CalendarIcon, MapPinIcon } from '../heroicons.tsx'
import { HealthWorkerAppointment } from '../../types.ts'
import { prettyAppointmentTime, stringify } from '../../util/date.ts'
import AppointmentMenu from '../../islands/appointment-menu.tsx'

export default function Appointment(
  { appointment }: { appointment: HealthWorkerAppointment },
) {
  return (
    <li
      key={appointment.id}
      className='relative flex space-x-6 py-6 xl:static'
    >
      {appointment.patientImageUrl
        ? (
          <img
            // TODO
            src={appointment.patientImageUrl}
            alt=''
            className='h-14 w-14 flex-none rounded-full'
          />
        )
        : (
          <svg
            class='w-12 h-12 text-gray-400 -left-1'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              fill-rule='evenodd'
              d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
              clip-rule='evenodd'
            >
            </path>
          </svg>
        )}

      <div className='flex-auto'>
        <h3 className='pr-10 font-semibold text-gray-900 xl:pr-0'>
          {appointment.patientName}
        </h3>
        <dl className='mt-2 flex flex-col text-gray-500 xl:flex-row'>
          <div className='flex items-start space-x-3'>
            <dt className='mt-0.5'>
              <span className='sr-only'>Date</span>
              <CalendarIcon
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </dt>
            <dd>
              <time dateTime={stringify(appointment.start)}>
                {prettyAppointmentTime(stringify(appointment.start))}
              </time>
            </dd>
          </div>
          <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
            <dt className='mt-0.5'>
              <span className='sr-only'>Location</span>
              {/* TODO, use different icon for virtual appointments */}
              {appointment.location.type === 'physical'
                ? (
                  <MapPinIcon
                    className='h-5 w-5 text-gray-400'
                    aria-hidden='true'
                  />
                )
                : (
                  <MapPinIcon
                    className='h-5 w-5 text-gray-400'
                    aria-hidden='true'
                  />
                )}
            </dt>
            <dd>
              {appointment.location.type === 'physical'
                ? appointment.location.facility.name
                : <a href={appointment.location.href}>Online</a>}
            </dd>
          </div>
        </dl>
      </div>
      <AppointmentMenu />
    </li>
  )
}
