import { useEffect } from 'preact/hooks'
import { oauthParams } from '../../external-clients/google.ts'
import redirect from '../../util/redirect.ts'

const loginUrl =
  `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`

//work in progress: redirect currently does not work
export default function Redirect() {
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      console.log('get into here?')
      redirect(loginUrl)
    }, 3000)
    return () => {
      clearTimeout(redirectTimeout)
    }
  }, [])

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
              <button
                style={{ fontWeight: 'bold', textDecoration: 'none' }}
                onMouseOver={(e) =>
                  e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) =>
                  e.currentTarget.style.textDecoration = 'none'}
                onClick={() => {
                  return Response.redirect(loginUrl, 307)
                }}
              >
                click here.
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
