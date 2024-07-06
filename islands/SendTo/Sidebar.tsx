import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { PatientIntake, Sendable } from '../../types.ts'
import { SendToHeader } from './Header.tsx'
import { SendableList } from './List.tsx'
import { useSignal } from '@preact/signals'
import { SendToSelectedPatient } from './SelectedPatient.tsx'
import { SendToForm } from './Form.tsx'

export function SendToSidebar(
  { open, close, sendables, patient }: {
    open: boolean
    close: () => void
    sendables: Sendable[]
    patient: PatientIntake
  },
) {
  const selected = useSignal<Sendable | null>(null)

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className='relative z-10' onClose={close}>
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
                    <SendToHeader close={close} />
                    <SendableList
                      sendables={sendables}
                      selected={selected}
                    />
                    {selected.value && (
                      <SendToSelectedPatient patient={patient} />
                    )}
                    {selected.value && <SendToForm />}
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
