import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Signal } from '@preact/signals'
import { Sendable, SendableToEntity } from '../../types.ts'
import { SendableListItem } from './ListItem.tsx'

export function SendToSidebar(
  { open, sendables }: { open: Signal<boolean>; sendables: Sendable[] },
) {
  const [selectedEntity, setSelectedEntity] = useState<SendableToEntity | null>(
    null,
  )
  const handleEntityClick = ({ to }: Sendable) =>
    (to.type === 'entity') && setSelectedEntity(to)

  const handleBackClick = () => setSelectedEntity(null)

  const [additionalDetails, setAdditionalDetails] = useState<string>('')

  return (
    <Transition show={open.value} as={Fragment}>
      <Dialog className='relative z-10' onClose={() => open.value = false}>
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
                            onClick={() => open.value = false}
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
                      {sendables.map((sendable) => (
                        <SendableListItem
                          key={sendable.key}
                          sendable={sendable}
                          selected={selectedEntity === sendable.to}
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
  )
}
