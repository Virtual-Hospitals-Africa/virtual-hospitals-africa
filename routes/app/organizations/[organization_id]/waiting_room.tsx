import * as waiting_room from '../../../../db/models/waiting_room.ts'
import WaitingRoomView from '../../../../components/waiting_room/View.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { OrganizationContext } from './_middleware.ts'

export default HealthWorkerHomePageLayout(
  'Waiting Room',
  async function WaitingRoomPage(
    ctx: OrganizationContext,
  ) {
    console.log('mmmm')
    const { trx, organization, organization_employment } = ctx.state
    const can_register_patients = !!organization.location

    return (
      <WaitingRoomView
        organization_id={organization.id}
        waiting_room={await waiting_room.get(trx, organization_employment)}
        can_register_patients={can_register_patients}
      />
    )
  },
)
