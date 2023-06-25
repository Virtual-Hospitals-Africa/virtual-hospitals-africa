import { CalendarIcon, MapPinIcon } from '../heroicons.tsx'
import { HealthWorkerAppointment } from '../../types.ts'
import {
  prettyAppointmentTime,
  stringify,
  timeInSimpleAmPm,
  timeRangeInSimpleAmPm,
} from '../../util/date.ts'
import AppointmentMenu from './AppointmentMenu.tsx'
import GoogleMeetIcon from '../icons/google-meet.tsx'

export default function Appointment(
  { route, appointment }: {
    route: string
    appointment: HealthWorkerAppointment
  },
) {
  const href = `${route}/appointments/${appointment.id}`

  return (
    <li
      key={appointment.id}
      className='relative flex space-x-6 py-6 xl:static hover:bg-gray-50 px-2 py-3'
    >
      <a href={href}>
        {appointment.patientImageUrl
          ? (
            <img
              src={appointment.patientImageUrl}
              alt=''
              className='h-14 w-14 flex-none rounded-full'
            />
          )
          : (
            <svg
              className='h-14 w-14 flex-none rounded-full'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M5.121 17.804C7.21942 16.6179 9.58958 15.9963 12 16C14.5 16 16.847 16.655 18.879 17.804M15 10C15 10.7956 14.6839 11.5587 14.1213 12.1213C13.5587 12.6839 12.7956 13 12 13C11.2044 13 10.4413 12.6839 9.87868 12.1213C9.31607 11.5587 9 10.7956 9 10C9 9.20435 9.31607 8.44129 9.87868 7.87868C10.4413 7.31607 11.2044 7 12 7C12.7956 7 13.5587 7.31607 14.1213 7.87868C14.6839 8.44129 15 9.20435 15 10ZM21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z'
                stroke='#3F3F46'
                stroke-width='1.5'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
            </svg>
          )}

        <div className='flex-auto'>
          <h3 className='pr-10 font-semibold text-gray-900 xl:pr-0'>
            {appointment.patientName}
          </h3>
          <dl className='mt-2 flex flex-col text-gray-500 xl:flex-row'>
            <div className='flex items-start space-x-1.5'>
              <dt>
                <span className='sr-only'>Date</span>
                <CalendarIcon
                  className='h-5 w-5 text-gray-400'
                  aria-hidden='true'
                />
              </dt>
              <dd>
                <time dateTime={stringify(appointment.start)}>
                  {timeRangeInSimpleAmPm(appointment.start, appointment.end)}
                </time>
              </dd>
            </div>
            <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
              <dt>
                {appointment.location.type === 'physical'
                  ? (
                    <>
                      <span className='sr-only'>Location</span>
                      <MapPinIcon
                        className='h-5 w-5 text-gray-400'
                        aria-hidden='true'
                      />
                      {appointment.location.facility.name}
                    </>
                  )
                  : (
                    <a
                      href={appointment.location.href}
                      className='text-indigo-600 font-bold flex'
                    >
                      <GoogleMeetIcon className='w-5 mr-1' />
                      Join Google Meet
                    </a>
                  )}
              </dt>
            </div>
          </dl>
        </div>
      </a>
      <AppointmentMenu href={href} />
    </li>
  )
}
