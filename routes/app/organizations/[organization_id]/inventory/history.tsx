import Layout from '../../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import InventoryHistoryTable from '../../../../../components/inventory/InventoryHistory.tsx'
import * as inventory from '../../../../../db/models/inventory.ts'
import { OrganizationContext } from '../_middleware.ts'

export default async function InventoryHistoryPage(
  _req: Request,
  { route, url, state }: OrganizationContext,
) {
  const consumable_id = url.searchParams.get('consumable_id')
  assertOr404(consumable_id)

  const consumable = await inventory.getConsumablesHistory(
    state.trx,
    { organization_id: state.organization.id, consumable_id },
  )

  return (
    <Layout
      variant='home page'
      title={`Inventory History: ${consumable.name}`}
      route={route}
      url={url}
      health_worker={state.healthWorker}
    >
      <InventoryHistoryTable history={consumable.history} />
    </Layout>
  )
}
