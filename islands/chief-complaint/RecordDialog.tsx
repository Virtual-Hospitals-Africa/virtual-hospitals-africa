import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../../components/library/Button.tsx'
import { Fragment } from 'preact'

export type RecordingState = {
  recording: false
  stop?: never
  cancel?: never
} | {
  recording: true
  stop(): void
  cancel(): void
}

export function RecordDialog(
  { recording, stop /*, cancel*/ }: RecordingState,
) {
  return (
    <Transition.Root show={recording} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={() => globalThis.location.hash = ''}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex items-center justify-center min-h-full p-4 text-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative max-h-screen transition-all transform rounded-lg shadow-xl max-w-screen'>
                <Button type='button' onClick={stop}>
                  Stop Recording
                </Button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
