import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Button } from '../../components/library/Button.tsx'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { ButtonsContainer } from '../../islands/form/buttons.tsx'
import TeamMember from '../../components/library/TeamMember.tsx'

const tabs = [
  { name: 'All', href: '#', current: true },
]

const team: {
  name: string
  handle: string
  href: string
  imageUrl: string
  status: 'online' | 'offline'
  description: string
}[] = [
  {
    name: 'Waiting Room',
    handle: '',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
    description: 'Seeing Jonathan Jones until 3:30pm',
  },
  {
    name: 'Nurse A',
    handle: 'Dr. Buhlebenkosi Ndlovu',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  {
    name: 'Nurse B',
    handle: 'Dr. Sikhululiwe Ngwenya',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  {
    name: 'Nurse C',
    handle: 'Dr.NurseC',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  {
    name: 'Another Practitioner',
    handle: '',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  {
    name: 'Another Facility',
    handle: '',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  {
    name: 'Another Device',
    handle: '',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
    description: 'Unavailable until tomorrow at 9:00am',
  },
  // more people...
]

function classNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [open, setOpen] = useState(false) // The initial state is false, indicating that the sidebar is hidden

  const handleTabClick = (name: string) => {
    tabs.forEach((tab) => {
      tab.current = tab.name === name
    })
  }

  const filteredTeam = tabs.find((tab) => tab.current)?.name === 'All'
    ? team
    : team.filter((person) =>
      person.status === tabs.find((tab) => tab.current)?.name.toLowerCase()
    )

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
                      <div className='p-6'>
                        <div className='flex items-start justify-between'>
                          <Dialog.Title className='text-base font-semibold leading-6 text-gray-900'>
                            Team
                          </Dialog.Title>
                          <div className='ml-3 flex h-7 items-center'>
                            <button
                              type='button'
                              className='relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500'
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
                      <div className='border-b border-gray-200'>
                        <div className='px-6'>
                          <nav className='-mb-px flex space-x-6'>
                            {tabs.map((tab) => (
                              <a
                                key={tab.name}
                                href={tab.href}
                                onClick={() => handleTabClick(tab.name)}
                                className={classNames(
                                  tab.current
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                  'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                                )}
                              >
                                {tab.name}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>
                      <ul
                        role='list'
                        className='flex-1 divide-y divide-gray-200 overflow-y-auto'
                      >
                        {filteredTeam.map((person) => (
                          <TeamMember
                            key={person.name}
                            name={person.name}
                            handle={person.handle}
                            imageUrl={person.imageUrl}
                            status={person.status}
                            description={person.description}
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
