import { Dialog, Transition } from '@headlessui/react'
import { Button } from '../../components/library/Button.tsx'

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
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full justify-center p-4 text-center items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-lg shadow-xl transition-all max-h-screen max-w-screen'>
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
