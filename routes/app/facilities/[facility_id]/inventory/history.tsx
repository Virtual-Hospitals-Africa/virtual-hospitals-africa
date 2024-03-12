import { FreshContext, PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  Facility,
  HasId,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedInventoryHistory,
} from '../../../../../types.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import InventoryHistoryTable from '../../../../../components/inventory/InventoryHistory.tsx'
import * as inventory from '../../../../../db/models/inventory.ts'

type HistoryPageProps = {
  facility: HasId<Facility>
  inventory_history: RenderedInventoryHistory[]
  healthWorker: EmployedHealthWorker
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  HistoryPageProps
> = {
  async GET(_req, ctx) {
    const { healthWorker, facility } = ctx.state
    const facility_id = parseInt(ctx.params.facility_id)
    const consumable_Id = parseInt(ctx.url.searchParams.get('consumable_id')!)
    assertOr404(facility_id)
    assertOr404(consumable_Id)

    const inventory_history = await inventory.getFacilityConsumablesHistory(
      ctx.state.trx,
      { facility_id: facility_id, consumable_id: consumable_Id },
    )

    return ctx.render({
      facility,
      healthWorker,
      inventory_history,
    })
  },
}

export default function HistoryPage(
  props: PageProps<HistoryPageProps>,
) {
  return (
    <Layout
      variant='home page'
      title='History'
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
    >
      <InventoryHistoryTable
        facility_id={props.data.facility.id}
        details={props.data.inventory_history}
      />
    </Layout>
  )
}
