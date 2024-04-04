import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useEffect } from 'preact/hooks'

export default function DemoVideo() {
  const [open, setOpen] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#demo') {
      setOpen(true)
      setTimeout(() => {
        setAutoplay(true)
      }, 150)
    }
    self.addEventListener('hashchange', () => {
      if (window.location.hash === '#demo') {
        setOpen(true)
        setTimeout(() => {
          setAutoplay(true)
        }, 150)
      } else {
        setOpen(false)
        setAutoplay(false)
      }
    })
  }, [])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        className='relative z-10'
        onClose={() => window.location.hash = ''}
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
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-lg shadow-xl transition-all pt-6 px-24 max-h-screen'>
                <video controls className='rounded-lg w-xl' autoplay={autoplay}>
                  <source src='/demo.mp4' type='video/mp4' />
                </video>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
