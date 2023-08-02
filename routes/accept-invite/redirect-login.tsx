import { useEffect } from 'preact/hooks'
import redirect from '../../util/redirect.ts'

//work in progress: redirect currently does not work
export default function RedirectLogin() {
  return (
    <div className='rounded-md bg-yellow-50 p-4'>
      <div className='flex'>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-yellow-800'>
            Welcome to Virtual Hospitals Africa! Please login with your Gmail
            account
          </h3>
          <div className='mt-2 text-sm text-yellow-700'>
            <p>
              <a href='/login'>
                click here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
