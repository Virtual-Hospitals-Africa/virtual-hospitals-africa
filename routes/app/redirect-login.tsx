import { useEffect, useRef } from 'preact/hooks'
import { oauthParams } from '../../external-clients/google.ts'
import redirect from '../../util/redirect.ts'

export default function Redirect() {
  const redirectTimeout = setTimeout(() => {
    console.log('get into use effect?')
    const url = '/app'
    //`https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    redirect('/app')
  }, 3000)

  return (
    <div className='rounded-md bg-yellow-50 p-4'>
      <div className='flex'>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-yellow-800'>
            Please login with your Gmail account
          </h3>
          <div className='mt-2 text-sm text-yellow-700'>
            <p>
              If you are not redirected in 3 seconds, please{' '}
              <button onClick={() => redirect('/app')}>
                click here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
