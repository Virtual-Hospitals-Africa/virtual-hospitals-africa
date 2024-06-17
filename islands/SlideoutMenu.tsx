import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx';
import { EllipsisVerticalIcon } from '../components/library/icons/heroicons/solid.tsx';
import { Button } from '../components/library/Button.tsx'
import Buttons, {
  ButtonsContainer,
} from '../islands/form/buttons.tsx'

const tabs = [
  { name: 'All', href: '#', current: true },
];

const team = [
  {
    name: 'Waiting Room',
    handle: 'WaitingRoom',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Nurse A',
    handle: 'NurseA',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Nurse B',
    handle: 'NurseB',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Nurse C',
    handle: 'NurseC',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Another Practitioner',
    handle: 'AnotherPractitioner',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1564564295391-7f24f26f568b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  {
    name: 'Another Facility',
    handle: 'AnotherFacility',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Another Device',
    handle: 'AnotherDevice',
    href: '#',
    imageUrl:
     'https://images.unsplash.com/photo-1603415526960-f8fcd80a2d52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'offline',
  },
  // more people...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [open, setOpen] = useState(false); // The initial state is false, indicating that the sidebar is hidden

  return (
    <div className='flex-1 max-w-xl '>
      {/* Add a button to toggle the open state */}
      <ButtonsContainer className="flex space-x-4">
        <Button
          type="button"
          variant='outline'
          color='blue'
          className='flex-1 max-w-xl '
          onClick={() => setOpen(true)}
        >
          Send to
        </Button>
      </ButtonsContainer>
      <Transition show={open} as={Fragment}>
        <Dialog className="relative z-10" onClose={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-25" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto fixed right-0 top-0 h-full w-[calc(100vw-12rem)] bg-white shadow-xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">Team</Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-b border-gray-200">
                        <div className="px-6">
                          <nav className="-mb-px flex space-x-6">
                            {tabs.map((tab) => (
                              <a
                                key={tab.name}
                                href={tab.href}
                                className={classNames(
                                  tab.current
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                  'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                                )}
                              >
                                {tab.name}
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>
                      <ul role="list" className="flex-1 divide-y divide-gray-200 overflow-y-auto">
                        {team.map((person) => (
                          <li key={person.handle}>
                            <div className="group relative flex items-center px-5 py-6">
                              <a href={person.href} className="-m-1 block flex-1 p-1">
                                <div className="absolute inset-0 group-hover:bg-gray-50" aria-hidden="true" />
                                <div className="relative flex min-w-0 flex-1 items-center">
                                  <span className="relative inline-block flex-shrink-0">
                                    <img className="h-10 w-10 rounded-full" src={person.imageUrl} alt="" />
                                    <span
                                      className={classNames(
                                        person.status === 'online' ? 'bg-green-400' : 'bg-gray-300',
                                        'absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                                      )}
                                      aria-hidden="true"
                                    />
                                  </span>
                                  <div className="ml-4 truncate">
                                    <p className="truncate text-sm font-medium text-gray-900">{person.name}</p>
                                    <p className="truncate text-sm text-gray-500">{'@' + person.handle}</p>
                                  </div>
                                </div>
                              </a>
                              <Menu as="div" className="relative ml-2 inline-block flex-shrink-0 text-left">
                                <Menu.Button className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                  <span className="absolute -inset-1.5" />
                                  <span className="sr-only">Open options menu</span>
                                  <span className="flex h-full w-full items-center justify-center rounded-full">
                                    <EllipsisVerticalIcon
                                      className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </Menu.Button>
                                <Transition
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute right-9 top-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <a
                                            href="#"
                                            className={classNames(
                                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                              'block px-4 py-2 text-sm'
                                            )}
                                          >
                                            View profile
                                          </a>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </li>
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
  );
}
