import { Dialog, Transition } from '@headlessui/react'
import { JSX } from 'preact'
import { Fragment, useState } from 'react'
import { Button } from '../components/library/Button.tsx'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'
import { ButtonsContainer } from './form/buttons.tsx'
import cls from '../util/cls.ts'
import { ComponentChild } from 'preact'


type Sendable =
  & {
    image: {
      type: 'avatar'
      url: string
    } | {
      type: 'icon'
      component: ComponentChild
    }
    name: string
    description?: {
      text: string
      href?: string
      parenthetical?: string
    }
    status: string
    online?: true | false
    reopenTime?: string
    menu_options?: {
      name: string
      href: string
    }[]
  }
  & (
    {
      type: 'entity'
      entity_type: 'person' | 'facility'
      entity_id: string
    } | {
      type: 'action'
      action: 'search' | 'waiting_room' | 'device'
      href: string
    }
  )

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
        'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    online: false,
    status: 'Unavailable until tomorrow at 9:00am',
  },
  {
    type: 'entity',
    entity_type: 'facility',
    entity_id: 'another_facility',
    name: 'Another Facility',
    description: {
      text: '1600 Amphitheatre Parkway, Mountain View, CA',
      parenthetical: 'address'
    },
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    online: true,
    status: 'Accepting patients',
    reopenTime: 'Reopens 9:00am',
  },
  {
    type: 'entity',
    entity_type: 'facility',
    entity_id: 'another_facility',
    name: 'Another Facility',
    description: {
      text: '1600 Amphitheatre Parkway, Mountain View, CA',
      parenthetical: 'address'
    },
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
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
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    status: 'To be seen by the next available practitioner',
  },
  {
    type: 'action',
    action: 'device',
    href: '/another-device',
    name: 'Device via Bluetooth',
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    status: 'Connect with trusted devices of known colleagues',
  },
  {
    type: 'action',
    action: 'search',
    href: '/search',
    name: 'Search',
    image: {
      type: 'avatar',
      url:
        'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    status: 'Nurses,Doctors,Hospitals,Clinics,Virtual Organizations,\nSpecialists,Laboratories,Pharmacies',
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
  handle: string
  imageUrl: string
  online: boolean
  status: string
  reopenTime?: string
  href: string
}

export function SendableComponent(
  { name, description, handle, imageUrl, online, status, reopenTime, href }:
    TeamMemberProps,
): JSX.Element {
  return (
    <li>
      <div className='group relative flex items-center px-5 py-6'>
        <a href={href} className='-m-1 block flex-1 p-1'>
          <div
            className='absolute inset-0 group-hover:bg-gray-50'
            aria-hidden='true'
          />
          <div className='relative flex min-w-0 flex-1 items-center'>
            <span className='relative inline-block flex-shrink-0'>
              <img className='h-10 w-10 rounded-full' src={imageUrl} alt='' />
              {online != null && (
                <span
                  className={`${online ? 'bg-green-400' : 'bg-gray-300'} absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white`}
                  aria-hidden='true'
                />
              )}
            </span>
            <div className='ml-4 truncate'>
              <p className='truncate text-sm font-semibold text-gray-900'>
                {name}
              </p>
              {description && (
                <p className='truncate text-xs text-gray-500'>
                  {description.parenthetical === 'address' ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        description.text
                      )}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500'
                    >
                      {description.text}
                    </a>
                  ) : (
                    description.text
                  )}
                  {description.parenthetical && ` (${description.parenthetical})`}
                </p>
              )}
              <p className='truncate text-sm text-gray-500'>{handle}</p>
              {status && (
                <p className='truncate text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
                  {status}
                </p>
              )}
              {!online && reopenTime && (
                <p className='truncate text-xs font-ubuntu text-gray-500'>
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

export default function SendToMenu() {
  const [open, setOpen] = useState(false) // The initial state is false, indicating that the sidebar is hidden

  return (
    <div className='flex-1 max-w-xl'>
      {/* Add a button to toggle the open state */}
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
                      <ul
                        role='list'
                        className='flex-1 divide-y divide-gray-200 overflow-y-auto'
                      >
                        {sendable.map((person) => (
                          <SendableComponent
                            key={person.name}
                            name={person.name}
                            description={person.description}
                            handle={person.handle}
                            imageUrl={person.imageUrl}
                            online={person.online}
                            status={person.status}
                            reopenTime={person.reopenTime}
                            href={person.href}
                          />
                        ))}
                      </ul>
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
