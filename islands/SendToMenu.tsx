import { Dialog, Transition } from '@headlessui/react'
import { JSX } from 'preact'
import { Fragment, useEffect, useState } from 'react'
import { Button } from '../components/library/Button.tsx'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'
import { ButtonsContainer } from './form/buttons.tsx'
import cls from '../util/cls.ts'
import { ComponentChild } from 'preact'
import {
  BuildingOffice2Icon,
  ClockIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import { Sendable } from './types.ts'
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
} from '../components/library/icons/SendToDetailView.tsx'
import { useSendableData } from './useSendableData.tsx'

const apiKey = 'AIzaSyAsdOgA2ZCD3jdxuoR0jN0lYYV3nZnBpd8'

async function getPlaceId(address: string): Promise<string> {
  const targetUrl =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${
      encodeURIComponent(address)
    }&inputtype=textquery&fields=place_id&key=${apiKey}`
  const proxyUrl = `https://api.allorigins.win/get?url=${
    encodeURIComponent(targetUrl)
  }`

  const response = await fetch(proxyUrl)
  const data = await response.json()

  if (data.contents) {
    const jsonData = JSON.parse(data.contents)
    console.log(`jsonData: ${JSON.stringify(jsonData)}`)
    if (jsonData.candidates && jsonData.candidates.length > 0) {
      return jsonData.candidates[0].place_id
    } else {
      throw new Error('Place ID not found')
    }
  } else {
    throw new Error('Failed to fetch data from proxy')
  }
}

async function getOpeningHours(placeId: string): Promise<any> {
  const targetUrl =
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${apiKey}`
  const proxyUrl = `https://api.allorigins.win/get?url=${
    encodeURIComponent(targetUrl)
  }`
  console.log(`proxyUrl: ${proxyUrl}`)

  const response = await fetch(proxyUrl)
  const data = await response.json()

  if (data.contents) {
    const jsonData = JSON.parse(data.contents)
    if (jsonData.result && jsonData.result.opening_hours) {
      return jsonData.result.opening_hours
    } else {
      throw new Error('Opening hours not found')
    }
  } else {
    throw new Error('Failed to fetch data from proxy')
  }
}

function checkIfOpen(openingHours: any): boolean {
  if (!openingHours || !openingHours.periods) return false

  const now = new Date()
  const day = now.getDay() // 0 (Sunday) to 6 (Saturday)
  const time = now.getHours() * 100 + now.getMinutes() // HHMM format

  for (const period of openingHours.periods) {
    if (period.open.day === day) {
      const openTime = parseInt(period.open.time)
      const closeTime = parseInt(period.close.time)

      if (openTime <= time && time <= closeTime) {
        return true
      }
    }
  }

  return false
}

export async function updateOnlineStatus(sendable: Sendable[]) {
  const updatedSendable = [...sendable]
  for (let i = 0; i < updatedSendable.length; i++) {
    const item = updatedSendable[i]
    if (item.type === 'entity' && item.entity_type === 'facility') {
      const address = item.description?.text
      if (address) {
        try {
          const placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4' //await getPlaceId(address);
          const openingHours = await getOpeningHours(placeId)
          const isOpen = checkIfOpen(openingHours)
          item.online = isOpen
          console.log(`Place ID for ${address}: ${placeId}`)
          console.log(`Is open: ${isOpen}`)
        } catch (error) {
          console.error(`Error updating status for ${address}:`, error)
        }
      }
    }
  }

  return updatedSendable
}

/* to make sure we got place ID
async function updateOnlineStatus(sendable: Sendable[]) {
  const updatedSendable = [...sendable];

  for (let i = 0; i < updatedSendable.length; i++) {
    const item = updatedSendable[i];
    if (item.type === 'entity' && item.entity_type === 'facility') {
      const address = item.description?.text;
      if (address) {
        try {
          const placeId = await getPlaceId(address);
          item.status = placeId; // update status

          console.log(`Place ID for ${address}: ${placeId}`);
        } catch (error) {
          console.error(`Error updating status for ${address}:`, error);
        }
      }
    }
  }
  return updatedSendable;
}*/

const sendable: Sendable[] = [
  {
    type: 'entity',
    entity_type: 'person',
    entity_id: 'nurse_a',
    name: 'Nurse A',
    description: {
      text: 'Primary Care Nurse',
    },
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    online: false,
    status: 'Unavailable until tomorrow at 9:00am',
  },
  {
    type: 'entity',
    entity_type: 'person',
    entity_id: 'nurse_b',
    name: 'Nurse B',
    description: {
      text: 'Primary Care Nurse',
    },
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    online: true,
    status: 'Seeing a patient until 3:30pm',
  },
  {
    type: 'entity',
    entity_type: 'person',
    entity_id: 'nurse_c',
    name: 'Nurse C',
    description: {
      text: 'Primary Care Nurse',
    },
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    online: false,
    status: 'Unavailable until tomorrow at 9:00am',
  },
  {
    type: 'entity',
    entity_type: 'facility',
    entity_id: 'another_facility_a',
    name: 'Another Facility A',
    description: {
      text: '5 More London Place, Tooley St, London SE1 2BY, United Kingdom',
      parenthetical: 'address',
    },
    image: {
      type: 'icon',
      component: <BuildingOffice2Icon />,
    },
    online: true,
    status: 'Accepting patients',
    reopenTime: 'Reopens 9:00am',
  },
  {
    type: 'entity',
    entity_type: 'facility',
    entity_id: 'another_facility_b',
    name: 'Another Facility B',
    description: {
      text: '1600 Amphitheatre Parkway, Mountain View, CA',
      parenthetical: 'address',
    },
    image: {
      type: 'icon',
      component: <BuildingOffice2Icon />,
    },
    online: false,
    status: 'Accepting patients',
    reopenTime: 'Reopens 9:00am',
  },
  {
    type: 'action',
    action: 'waiting_room',
    href: '/app',
    name: 'Waiting Room',
    image: {
      type: 'icon',
      component: <ClockIcon />,
    },
    status: 'To be seen by the next available practitioner',
  },
  {
    type: 'action',
    action: 'device',
    href: '/another-device',
    name: 'Device via Bluetooth',
    image: {
      type: 'icon',
      component: <DevicePhoneMobileIcon />,
    },
    status: 'Connect with trusted devices of known colleagues',
  },
  {
    type: 'action',
    action: 'search',
    href: '/search',
    name: 'Search',
    image: {
      type: 'icon',
      component: <MagnifyingGlassIcon />,
    },
    status:
      'Nurses,Doctors,Hospitals,Clinics,Virtual Organizations,\nSpecialists,Laboratories,Pharmacies',
  },
  // more people...
]

type TeamMemberProps = {
  name: string
  description?: {
    text: string
    href?: string
    parenthetical?: string
  }
  imageUrl?: string
  imageComponent?: ComponentChild
  online?: boolean
  status: string
  reopenTime?: string
}

export function SendableComponent(
  {
    name,
    description,
    imageUrl,
    imageComponent,
    online,
    status,
    reopenTime,
    onClick,
  }: TeamMemberProps & { onClick: () => void },
): JSX.Element {
  return (
    <li onClick={onClick}>
      <div className='group relative flex items-center px-5 py-6'>
        <a className='-m-1 block flex-1 p-1'>
          <div
            className='absolute inset-0 group-hover:bg-gray-50'
            aria-hidden='true'
          />
          <div className='relative flex min-w-0 flex-1 items-center'>
            <span className='relative inline-block flex-shrink-0'>
              <div className='h-10 w-10 rounded-full flex items-center justify-center bg-gray-200'>
                {imageUrl
                  ? (
                    <img
                      className='h-10 w-10 rounded-full'
                      src={imageUrl}
                      alt=''
                    />
                  )
                  : (
                    <div className='h-6 w-6 flex items-center justify-center'>
                      {imageComponent}
                    </div>
                  )}
              </div>
              {online != null && (
                <span
                  className={`${
                    online ? 'bg-green-400' : 'bg-gray-300'
                  } absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white`}
                  aria-hidden='true'
                />
              )}
            </span>
            <div className='ml-4'>
              <p className='text-sm font-sans font-medium text-gray-900 leading-normal'>
                {name}
              </p>
              {description && (
                <p className='text-sm font-sans text-gray-500 leading-normal'>
                  {description.parenthetical === 'address'
                    ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${
                          encodeURIComponent(
                            description.text,
                          )
                        }`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 break-words'
                      >
                        {description.text}
                      </a>
                    )
                    : (
                      description.text
                    )}
                </p>
              )}
              {status && (
                <p className='text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                  {status}
                </p>
              )}
              {!online && reopenTime && (
                <p className='text-xs font-ubuntu text-gray-500'>
                  {reopenTime}
                </p>
              )}
            </div>
          </div>
        </a>
      </div>
    </li>
  )
}

export function PersonDetailView(
  { entity, onBack, additionalDetails, setAdditionalDetails }: {
    entity: Sendable
    onBack: () => void
    additionalDetails: string
    setAdditionalDetails: (details: string) => void
  },
) {
  const [showCircleReview, setShowCircleReview] = useState(false)
  const [showCircleAppointment, setShowCircleAppointment] = useState(false)
  const [showCircleEmergency, setShowCircleEmergency] = useState(false)

  const handleActionClick = (action: string) => {
    if (action === 'review') {
      setShowCircleReview(!showCircleReview)
      setShowCircleAppointment(false)
      setShowCircleEmergency(false)
    } else if (action === 'appointment') {
      setShowCircleAppointment(!showCircleAppointment)
      setShowCircleReview(false)
      setShowCircleEmergency(false)
    } else if (action === 'emergency') {
      setShowCircleEmergency(!showCircleEmergency)
      setShowCircleReview(false)
      setShowCircleAppointment(false)
    }
  }

  return (
    <div className='group relative flex flex-col'>
      <div className='divide-y divide-gray-200'>
        <div className='px-5 py-6'>
          <div className='flex items-center cursor-pointer' onClick={onBack}>
            <span className='relative inline-block flex-shrink-0'>
              <div className='h-10 w-10 rounded-full flex items-center justify-center bg-gray-200'>
                {entity.image.type === 'avatar'
                  ? (
                    <img
                      className='h-10 w-10 rounded-full'
                      src={entity.image.url}
                      alt={entity.name}
                    />
                  )
                  : (
                    <div className='h-6 w-6 flex items-center justify-center'>
                      {entity.image.component}
                    </div>
                  )}
                {entity.online != null && (
                  <span
                    className={`${
                      entity.online ? 'bg-green-400' : 'bg-gray-300'
                    } absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white`}
                    aria-hidden='true'
                  />
                )}
              </div>
            </span>
            <div className='ml-4'>
              <h1 className='text-sm font-sans font-medium text-gray-900 leading-normal'>
                {entity.name}
              </h1>
              {entity.description && (
                <p className='text-sm font-sans text-gray-500 leading-normal'>
                  {entity.description.text}
                </p>
              )}
              <p className='text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                {entity.status}
              </p>
              {entity.reopenTime && (
                <p className='text-xs font-ubuntu text-gray-500'>
                  {entity.reopenTime}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className='px-5 py-6'>
          <div className='flex items-center'>
            <img
              className='h-10 w-10 rounded-full mr-4'
              src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
              alt='Susan Mlalazi'
            />
            <div>
              <h2 className='text-sm font-sans font-medium text-gray-900 leading-normal'>
                Susan Mlalazi
              </h2>
              <p className='text-sm font-sans text-gray-500 leading-normal'>
                female, 16/3/2024
              </p>
              <p className='truncate text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                <a href='/Notes' className='text-blue-500'>Clinical Notes</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='border-t border-gray-200'></div>
      <div className='mt-4 px-5'>
        <ul className='space-y-6 py-6'>
          <li className='flex items-center'>
            <span className='mr-2 text-indigo-900'>
              <ClipboardDocumentCheckIcon
                className={`w-6 h-6 ${
                  showCircleReview ? 'bg-indigo-200 rounded-full p-1' : ''
                }`}
              />
            </span>
            <span
              className='text-sm font-sans font-medium text-gray-900 leading-normal cursor-pointer hover:underline'
              onClick={() => handleActionClick('review')}
            >
              Request Review
            </span>
          </li>
          <li className='flex items-center'>
            <span className='mr-2 text-blue-500'>
              <CalendarDaysIcon
                className={`w-6 h-6 ${
                  showCircleAppointment ? 'bg-blue-200 rounded-full p-1' : ''
                }`}
              />
            </span>
            <span
              className='text-sm font-sans font-medium text-gray-900 leading-normal cursor-pointer hover:underline'
              onClick={() => handleActionClick('appointment')}
            >
              Make Appointment
            </span>
          </li>
          <li className='flex items-center'>
            <span className='mr-2 text-red-500'>
              <ShieldExclamationIcon
                className={`w-6 h-6 ${
                  showCircleEmergency ? 'bg-red-200 rounded-full p-1' : ''
                }`}
              />
            </span>
            <span
              className='text-sm font-sans font-medium text-gray-900 leading-normal cursor-pointer hover:underline'
              onClick={() => handleActionClick('emergency')}
            >
              Declare Emergency
            </span>
          </li>
        </ul>
      </div>
      <div className='mt-6 px-4'>
        <h2 className='text-lg font-semibold'>Additional Details</h2>
        <textarea
          className='w-full border border-gray-300 rounded-md p-2 mt-2'
          value={additionalDetails}
          onChange={(e) =>
            setAdditionalDetails((e.target as HTMLTextAreaElement).value)}
        >
        </textarea>
      </div>
      <div className='mt-6 px-4 flex justify-end'>
        <Button type='button' variant='solid' color='blue'>
          Send
        </Button>
      </div>
    </div>
  )
}

export default function SendToMenu() {
  const [open, setOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Sendable | null>(null)
  const handleEntityClick = (entity: Sendable) => {
    if (
      entity.type === 'entity' &&
      (entity.entity_type === 'person' || entity.entity_type === 'facility')
    ) {
      setSelectedEntity(entity)
    }
  }
  const handleBackClick = () => {
    setSelectedEntity(null)
  }
  const [additionalDetails, setAdditionalDetails] = useState<string>('')

  const updatedSendable = useSendableData(sendable);

  return (
    <div className='flex-1 max-w-xl'>
      <ButtonsContainer className='flex space-x-4'>
        <Button
          type='button'
          variant='outline'
          color='blue'
          className='flex-1 max-w-xl'
          onClick={() => setOpen(true)}
        >
          Send to
        </Button>
      </ButtonsContainer>
      <Transition show={open} as={Fragment}>
        <Dialog className='relative z-10' onClose={() => setOpen(false)}>
          <div className='fixed inset-0 bg-black bg-opacity-25' />
          <div className='fixed inset-0 overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden'>
              <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16'>
                <Transition.Child
                  as={Fragment}
                  enter='transform transition ease-in-out duration-500 sm:duration-700'
                  enterFrom='translate-x-full'
                  enterTo='translate-x-0'
                  leave='transform transition ease-in-out duration-500 sm:duration-700'
                  leaveFrom='translate-x-0'
                  leaveTo='translate-x-full'
                >
                  <Dialog.Panel className='pointer-events-auto fixed right-0 top-0 h-full w-[448px] bg-white shadow-xl'>
                    <div className='flex h-full flex-col overflow-y-scroll bg-white shadow-xl'>
                      <div className='p-6 bg-indigo-700'>
                        <div className='flex items-start justify-between'>
                          <Dialog.Title className='text-base font-semibold leading-6 text-white'>
                            Send to
                          </Dialog.Title>
                          <div className='ml-3 flex h-7 items-center'>
                            <button
                              type='button'
                              className='relative rounded-md bg-indigo-700 text-gray-200 hover:text-gray-500 focus:ring-2 focus:ring-indigo-700'
                              onClick={() => setOpen(false)}
                            >
                              <span className='absolute -inset-2.5' />
                              <span className='sr-only'>Close panel</span>
                              <XMarkIcon
                                className='h-6 w-6'
                                aria-hidden='true'
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      {selectedEntity
                        ? (
                          <PersonDetailView
                            entity={selectedEntity}
                            onBack={handleBackClick}
                            additionalDetails={additionalDetails}
                            setAdditionalDetails={setAdditionalDetails}
                          />
                        )
                        : (
                          <ul
                            role='list'
                            className='flex-1 divide-y divide-gray-200 overflow-y-auto'
                          >
                            {updatedSendable.map((entity) => (
                              <SendableComponent
                                key={entity.name}
                                name={entity.name}
                                description={entity.description}
                                imageUrl={entity.image.type === 'avatar'
                                  ? entity.image.url
                                  : undefined}
                                imageComponent={entity.image.type === 'icon'
                                  ? entity.image.component
                                  : null}
                                online={entity.online}
                                status={entity.status}
                                reopenTime={entity.reopenTime}
                                onClick={() => handleEntityClick(entity)}
                              />
                            ))}
                          </ul>
                        )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
