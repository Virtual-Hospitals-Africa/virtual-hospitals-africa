import { PageProps } from '$fresh/server.ts'
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
  consumable_id: number
  active_tab: string
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  HistoryPageProps
> = {
  async GET(_req, ctx) {
    const { healthWorker, facility } = ctx.state
    const facility_id = parseInt(ctx.params.facility_id)
    const consumable_id = parseInt(ctx.url.searchParams.get('consumable_id')!)
    const active_tab = ctx.url.searchParams.get('active_tab')!
    assertOr404(facility_id)
    assertOr404(consumable_id)

    const inventory_history = await inventory.getConsumablesHistory(
      ctx.state.trx,
      { facility_id: facility_id, consumable_id: consumable_id },
    )

    return ctx.render({
      facility,
      healthWorker,
      inventory_history,
      consumable_id,
      active_tab,
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
      <InventoryHistoryTable history={props.data.inventory_history} />
    </Layout>
  )
}
