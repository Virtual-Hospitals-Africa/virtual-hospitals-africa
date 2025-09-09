import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import * as waiting_room from '../db/models/waiting_room.ts'
import { LoggedInHealthWorker } from '../types.ts'
import WaitingRoomView from '../components/waiting_room/View.tsx'
import { firstName } from '../util/name.ts'
import redirect from '../util/redirect.ts'
import { HealthWorkerHomePageLayout } from './app/_middleware.tsx'

export default HealthWorkerHomePageLayout(
  async function AppPage(
    _req: Request,
    ctx: FreshContext<LoggedInHealthWorker>,
  ) {
    const { health_worker, trx } = ctx.state
    const { searchParams } = ctx.url
    // We may revisit this, but for now there's only one tab
    // that actually displays on this page, the waiting room
    // while the rest link out to other pages
    let organization_id = searchParams.get('organization_id')
    if (
      organization_id &&
      !health_worker.employment.some((e) =>
        e.organization.id === organization_id
      )
    ) {
      searchParams.set(
        'organization_id',
        health_worker.default_organization_id.toString(),
      )
      return redirect(`/app?${searchParams.toString()}`)
    }
    if (!organization_id) {
      if (health_worker.employment.length > 1) {
        console.warn('TODO: select organization?')
        searchParams.set(
          'organization_id',
          health_worker.default_organization_id.toString(),
        )
        return redirect(`/app?${searchParams.toString()}`)
      }
      organization_id = health_worker.default_organization_id
    }
    assert(organization_id)

    const getting_waiting_room = waiting_room.get(trx, {
      organization_id,
      health_worker: health_worker,
    })

    const { organization } = ctx.state.health_worker.employment.find((e) =>
      e.organization.id === organization_id
    )!
    const can_add_patients = !!organization.address

    return {
      title: `Good day, ${firstName(health_worker.name)}!`,
      children: (
        <WaitingRoomView
          organization_id={organization_id}
          waiting_room={await getting_waiting_room}
          can_add_patients={can_add_patients}
        />
      ),
    }
  },
)
