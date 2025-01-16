import { assertOr404 } from '../../../../../util/assertOr.ts'
import InventoryHistoryTable from '../../../../../components/inventory/InventoryHistory.tsx'
import * as inventory from '../../../../../db/models/inventory.ts'
import { OrganizationContext } from '../_middleware.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'

export default HealthWorkerHomePageLayout(
  async function InventoryHistoryPage(
    _req: Request,
    { url, state }: OrganizationContext,
  ) {
    const consumable_id = url.searchParams.get('consumable_id')
    assertOr404(consumable_id)

    const consumable = await inventory.getConsumablesHistory(
      state.trx,
      { organization_id: state.organization.id, consumable_id },
    )

    return {
      title: `Inventory History: ${consumable.name}`,
      children: <InventoryHistoryTable history={consumable.history} />,
    }
  },
)
