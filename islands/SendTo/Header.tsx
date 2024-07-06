import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '../../components/library/icons/heroicons/outline.tsx'

export function SendToHeader({ close }: { close: () => void }) {
  return (
    <div className='p-6 bg-indigo-700'>
      <div className='flex items-start justify-between'>
        <Dialog.Title className='text-base font-semibold leading-6 text-white'>
          Send to
        </Dialog.Title>
        <div className='ml-3 flex h-7 items-center'>
          <button
            type='button'
            className='relative rounded-md bg-indigo-700 text-gray-200 hover:text-gray-500 focus:ring-2 focus:ring-indigo-700'
            onClick={close}
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
  )
}
