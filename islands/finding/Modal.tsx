import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'preact'
import { FindingModalContents } from './ModalContents.tsx'
import { ConfiguredFinding } from '../../types.ts'

type FindingModalProps = {
  finding: ConfiguredFinding | null
  onSave: (finding: ConfiguredFinding) => void
  onClose: () => void
}

export function FindingModal(
  { finding, onSave, onClose }: FindingModalProps,
) {
  return (
    <Transition.Root show={finding !== null} as={Fragment}>
      <Dialog className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all'>
                {finding && (
                  <FindingModalContents
                    finding={finding}
                    onSave={onSave}
                    onClose={onClose}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
