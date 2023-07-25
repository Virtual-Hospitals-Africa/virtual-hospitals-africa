import { CheckIcon } from '../../components/library/CheckIcon.tsx'

export default function InviteConfirmation() {
  return (
    <div className='rounded-md bg-green-50 p-4'>
      <div className='flex'>
        <div className='flex-shrink-0'>
          <CheckIcon className='h-5 w-5 text-green-400' aria-hidden='true' />
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-green-800'>
            Invitation confirmed
          </h3>
          <div className='mt-2 text-sm text-green-700'>
            <p>
              We successfully confirmed your invitation. Please register your
              details on the sign up page.
            </p>
          </div>
          <div className='mt-4'>
            <div className='-mx-2 -my-1.5 flex'>
              <a href='register'>
                <button
                  type='button'
                  className='rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50'
                >
                  Go to sign up page
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
