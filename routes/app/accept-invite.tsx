import redirect from '../../util/redirect.ts'
import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  TrxOrDb,
} from '../../types.ts'
import {
  addEmployee,
  getInvitee,
  isHealthWorkerWithGoogleTokens,
  upsert,
} from '../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import { CheckIcon } from '../../components/library/CheckIcon.tsx'
import { redis } from '../../external-clients/redis.ts'
import generateUUID from '../../util/uuid.ts'

type AcceptInvitePageProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  invite: HealthWorkerInvitee
}

export const sessionId = generateUUID()

export const handler: LoggedInHealthWorkerHandler<AcceptInvitePageProps> = {
  async GET(req, ctx) {
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    const url = new URL(req.url)
    const invite_code = url.searchParams.get('inviteCode')
    assert(invite_code)

    await redis.set(sessionId, invite_code)

    const healthWorker = ctx.state.session.data
    if (!isHealthWorkerWithGoogleTokens(healthWorker)) {
      return redirect(`/app/redirect-login`)
    }

    const invite = await getInvitee(ctx.state.trx, {
      inviteCode: invite_code,
      email: ctx.state.session.data.email,
    })

    assert(invite)

    if (invite.facility_id !== facilityId) {
      throw new Error(
        `the path facilityId of ${facilityId} does not equal the invite facility id of ${invite.facility_id}`,
      )
    }

    addToHealthWorkerAndEmploymentTable(ctx.state.trx, healthWorker, invite)

    return ctx.render({ healthWorker, invite })
  },
}

export async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
  invite: HealthWorkerInvitee,
) {
  //TODO: check whether the healthworker already exists, and just add to employmnet table if so
  /*
  assert(
    await upsert(trx, {
      name: healthWorker.name,
      email: healthWorker.email,
      avatar_url: healthWorker.avatar_url,
      gcal_appointments_calendar_id: healthWorker.gcal_appointments_calendar_id,
      gcal_availability_calendar_id: healthWorker.gcal_availability_calendar_id,
    }),
  )
  */

  assert(
    await addEmployee(trx, {
      employee: {
        health_worker_id: healthWorker.id,
        profession: invite.profession,
        facility_id: invite.facility_id,
      },
    }),
  )
}

export function acceptInvite() {
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
              We seccessfully confirmed your invitation. Please register your
              details in a sign up page.
            </p>
          </div>
          <div className='mt-4'>
            <div className='-mx-2 -my-1.5 flex'>
              <button
                type='button'
                className='rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50'
              >
                Go to sign up page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
