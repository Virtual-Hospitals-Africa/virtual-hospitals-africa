import { FreshContext, PageProps } from '$fresh/server.ts'
import {
  Facility,
  HasId,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import * as inventory from '../../../../db/models/inventory.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import InventoryView from '../../../../components/inventory/View.tsx'

type inventoryPageProps = {
  facility: HasId<Facility>
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  inventoryPageProps,
  { facility: HasId<Facility>; isAdminAtFacility: boolean }
> = {
  GET(_req, ctx) {
    const { healthWorker, facility, isAdminAtFacility } = ctx.state

    return ctx.render({
      facility,
    })
  },
}

export default async function inventoryPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const facility_id = parseInt(ctx.params.facility_id)
  assertOr404(facility_id)

  const facility_devices = await inventory.getFacilityDevices(
    ctx.state.trx,
    { facility_id: facility_id },
  )

  return (
    <Layout
      title='Inventory'
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='home page'
    >
      <InventoryView
        facility_id={facility_id}
        devices={facility_devices}
      />
    </Layout>
  )
}
