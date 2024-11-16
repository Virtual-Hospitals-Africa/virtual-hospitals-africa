import {
  CalendarIcon,
  MapPinIcon,
} from '../library/icons/heroicons/outline.tsx'
import type {
  ProviderAppointmentSlot,
  RenderableAppointment,
} from '../../types.ts'
import { stringify, timeRangeInSimpleAmPm } from '../../util/date.ts'
import { GoogleMeetIcon } from '../library/icons/GoogleMeet.tsx'
import { WhatsAppIcon } from '../library/icons/whatsapp.tsx'
import Avatar from '../library/Avatar.tsx'
import Menu from '../../islands/Menu.tsx'
import { Button } from '../library/Button.tsx'

function AppointmentContents(
  { appointment, href }: {
    appointment: RenderableAppointment
    href?: string
  },
) {
  // Show the health worker when showing appointment slots,
  // the patient for the actual appointment
  // TODO: revisit whether we want to show all participants
  const featuring = appointment.type === 'provider_appointment'
    ? appointment.patient
    : appointment.providers[0]

  const header = (
    <h3 className='pr-10 font-semibold text-gray-900 xl:pr-0'>
      {featuring.name}
    </h3>
  )

  return (
    <>
      <Avatar src={featuring.avatar_url} className='h-14 w-14' />
      <div className='flex-auto'>
        {href ? <a href={href}>{header}</a> : header}
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
                {appointment.physicalLocation.organization.name}
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
          {'phone_number' in featuring && featuring.phone_number && (
            <div className='mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5'>
              <dt>
                <a
                  href={`https://wa.me/${featuring.phone_number}`}
                  className='text-indigo-600 font-bold flex'
                >
                  <WhatsAppIcon className='w-5 mr-1' />
                  Message
                </a>
              </dt>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}

function AppointmentSlot({ slot, url }: {
  url: URL
  slot: ProviderAppointmentSlot
}) {
  const search = new URLSearchParams(url.search)
  search.set('start', stringify(slot.start))
  search.set('end', stringify(slot.end))
  search.set('durationMinutes', String(slot.durationMinutes))
  if (slot.providers) {
    search.set(
      'provider_ids',
      JSON.stringify(
        slot.providers.map((provider) => provider.provider_id),
      ),
    )
  }
  return (
    <form
      action={`${url.pathname}?${search}`}
      method='POST'
    >
      <Button>
        Book
      </Button>
    </form>
  )
}

export default function Appointment(
  { url, appointment }: {
    url: URL
    appointment: RenderableAppointment
  },
) {
  const href = appointment.type === 'provider_appointment'
    ? `${url.pathname}/appointments/${appointment.id}`
    : undefined

  return (
    <li className='relative flex space-x-6 xl:static hover:bg-gray-50 px-2 py-3'>
      <AppointmentContents appointment={appointment} href={href} />
      {appointment.type === 'provider_appointment_slot'
        ? <AppointmentSlot slot={appointment} url={url} />
        : (
          <Menu
            icon='DotsVerticalIcon'
            options={[
              { label: 'Cancel', href: `${href}/cancel` },
              { label: 'Reschedule', href: `${href}/reschedule` },
            ]}
            className='top-2 right-2 xl:relative xl:right-auto xl:top-auto xl:self-center'
          />
        )}
    </li>
  )
}
