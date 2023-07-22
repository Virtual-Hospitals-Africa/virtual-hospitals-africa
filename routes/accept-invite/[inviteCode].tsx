import { LoggedInHealthWorkerHandler } from '../../types.ts'
import { useEffect } from 'preact/hooks'
import redirect from '../../util/redirect.ts'
import generateUUID from '../../util/uuid.ts'
import { redis } from '../../external-clients/redis.ts'
import { assert } from 'std/testing/asserts.ts'

export const sessionId = generateUUID()

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_req, ctx) {
    const inviteCode = ctx.params.inviteCode
    assert(inviteCode)

    await redis.set(sessionId, inviteCode)
    return new Response('Success', { status: 200 })
  },
}

//work in progress: redirect currently does not work
export function Redirect() {
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      console.log('get into here?')
      return redirect('/login')
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
                  return redirect('/login')
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
