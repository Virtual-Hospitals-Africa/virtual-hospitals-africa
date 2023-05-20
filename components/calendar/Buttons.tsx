import { FunctionComponent } from 'preact'

export const NullButton: FunctionComponent = () => (
  <div className='cursor-not-allowed absolute bottom-6 right-3 text-lg bg-gray-500 text-white py-3 px-6 rounded shadow-lg font-normal mb-2'>
    NULL
  </div>
)

export const PendingButtons: FunctionComponent = () => (
  <>
    <button className='absolute bottom-6 right-14 text-lg bg-green-600 text-white py-3 px-6 rounded shadow-lg font-normal mb-2 mr-20'>
      CONFIRM
    </button>
    <button className='absolute bottom-6 right-3 text-lg bg-red-600 text-white py-3 px-6 rounded shadow-lg font-normal mb-2'>
      DENY
    </button>
  </>
)

export const DeniedButton: FunctionComponent = () => (
  <div className='cursor-not-allowed absolute bottom-6 right-3 text-lg bg-red-600 text-white py-3 px-6 rounded shadow-lg font-normal mb-2'>
    DENIED
  </div>
)

export const ConfirmedButton: FunctionComponent = () => (
  <div className='cursor-not-allowed absolute bottom-6 right-3 text-lg bg-green-600 text-white py-3 px-6 rounded shadow-lg font-normal mb-2'>
    CONFIRMED
  </div>
)
