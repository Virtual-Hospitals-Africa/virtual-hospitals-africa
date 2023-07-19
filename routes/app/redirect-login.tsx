import { useEffect, useRef } from 'preact/hooks'
import { oauthParams } from '../../external-clients/google.ts'

export default function Redirect() {
  const redirectTimeout = useRef<number | null>(null)

  useEffect(() => {
    redirectTimeout.current = setTimeout(() => {
      const url =
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
      window.location.href = url
    }, 3000)

    return () => {
      if (redirectTimeout.current !== null) {
        clearTimeout(redirectTimeout.current)
      }
    }
  }, [])

  const handleClick = () => {
    if (redirectTimeout.current !== null) {
      clearTimeout(redirectTimeout.current)
    }
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    window.location.href = url
  }

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
              <a href='#' onClick={handleClick}>click here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
