import { CalendarIcon, MapPinIcon } from '../library/icons/heroicons.tsx'
import { HealthWorkerAppointment } from '../../types.ts'
import { stringify, timeRangeInSimpleAmPm } from '../../util/date.ts'
import GoogleMeetIcon from '../library/icons/google-meet.tsx'
import WhatsAppIcon from '../library/icons/whatsapp.tsx'
import Avatar from '../library/Avatar.tsx'
import Menu from '../../islands/Menu.tsx'

function AppointmentContents(
  { appointment, href }: { appointment: HealthWorkerAppointment; href: string },
) {
  return (
    <>
      <Avatar src={appointment.patient.image_url} />
      <div className='flex-auto'>
        <a href={href}>
          <h3 className='pr-10 font-semibold text-gray-900 xl:pr-0'>
            {appointment.patient.name}
          </h3>
        </a>
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
          {appointment.physicalLocation && (
            <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
              <dt>
                <span className='sr-only'>Location</span>
                <MapPinIcon
                  className='h-5 w-5 text-gray-400'
                  aria-hidden='true'
                />
                {appointment.physicalLocation.facility.name}
              </dt>
            </div>
          )}
          {appointment.virtualLocation && (
            <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
              <dt>
                <span className='sr-only'>Link</span>
                <a
                  href={appointment.virtualLocation.href}
                  className='text-indigo-600 font-bold flex'
                >
                  <GoogleMeetIcon className='w-5 mr-1' />
                  Join Google Meet
                </a>
              </dt>
            </div>
          )}
          {appointment.patient.phone_number && (
            <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
              <dt>
                <a
                  href={`https://wa.me/${appointment.patient.phone_number}`}
                  className='text-indigo-600 font-bold flex'
                >
                  <WhatsAppIcon className='w-5 mr-1' />
                  Message Patient
                </a>
              </dt>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}

export default function Appointment(
  { route, appointment }: {
    route: string
    appointment: HealthWorkerAppointment
  },
) {
  const href = `${route}/appointments/${appointment.id}`

  return (
    <li className='relative flex space-x-6 py-6 xl:static hover:bg-gray-50 px-2 py-3'>
      <AppointmentContents appointment={appointment} href={href} />
      <Menu
        options={[
          { label: 'Cancel', href: `${href}/cancel` },
          { label: 'Reschedule', href: `${href}/reschedule` },
        ]}
        className='top-2 right-2'
      />
    </li>
  )
}
