import { Dialog, Transition } from '@headlessui/react'
import { ComponentChildren, Fragment } from 'preact'
import { XMarkIcon } from '../components/library/icons/heroicons/solid.tsx'
import cls from '../util/cls.ts'

type MaxWidth =
  | 'max-w-3xs'
  | 'max-w-2xs'
  | 'max-w-xs'
  | 'max-w-sm'
  | 'max-w-md'
  | 'max-w-lg'
  | 'max-w-xl'
  | 'max-w-2xl'
  | 'max-w-3xl'
  | 'max-w-4xl'
  | 'max-w-5xl'
  | 'max-w-6xl'
  | 'max-w-7xl'

export type RightPanelProps = {
  show: boolean
  onClose: () => void
  title: string
  maxWidth?: MaxWidth
  children: ComponentChildren
}

export function RightPanel({
  show,
  onClose,
  title,
  maxWidth = 'max-w-md',
  children,
}: RightPanelProps) {
  return (
    <Transition.Root show={!!show} as={Fragment}>
      <Dialog onClose={() => null} className='relative z-10'>
        <div className='fixed inset-0 overflow-hidden'>
          <div className='absolute inset-0 overflow-hidden'>
            <div className='fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none sm:pl-16'>
              <Dialog.Panel // transition -- This messes things up
                className={cls(
                  'pointer-events-auto relative w-screen transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700',
                  maxWidth,
                )}
              >
                <Transition.Child as={Fragment}>
                  <div className='absolute top-0 left-0 flex pt-4 pr-2 -ml-8 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4'>
                    <button
                      type='button'
                      onClick={onClose}
                      className='relative text-gray-400 rounded-md hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                    >
                      <span className='absolute -inset-2.5' />
                      <span className='sr-only'>Close panel</span>
                      <XMarkIcon aria-hidden='true' className='size-6' />
                    </button>
                  </div>
                </Transition.Child>
                <div className='relative flex flex-col h-full py-6 overflow-y-auto bg-white shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-white/10'>
                  <div className='px-4 sm:px-6'>
                    <Dialog.Title className='text-base font-semibold text-white'>
                      {title}
                    </Dialog.Title>
                  </div>
                  <div className='relative flex-1 px-4 mt-6 sm:px-6'>
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
