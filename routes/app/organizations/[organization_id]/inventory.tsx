import * as inventory from '../../../../db/models/inventory.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import InventoryView from '../../../../components/inventory/View.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { OrganizationContext } from './_middleware.ts'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  'Inventory',
  async function InventoryPage(
    _req,
    ctx,
  ) {
    const { organization, isAdminAtOrganization } = ctx.state
    const { organization_id } = ctx.params
    const active_tab = ctx.url.searchParams.get('active_tab') ?? 'devices'
    assertOr404(organization_id)

    const organization_devices = active_tab === 'devices'
      ? await inventory.getDevices(
        ctx.state.trx,
        { organization_id: organization_id },
      )
      : []

    const organization_consumbales = active_tab === 'consumables'
      ? await inventory.getConsumables(
        ctx.state.trx,
        { organization_id: organization_id },
      )
      : []

    const organization_medicines = active_tab === 'medicines'
      ? await inventory.getMedicines(
        ctx.state.trx,
        { organization_id: organization_id },
      )
      : []

    return (
      <InventoryView
        organization_id={organization.id}
        devices={organization_devices}
        consumables={organization_consumbales}
        medicines={organization_medicines}
        isAdmin={isAdminAtOrganization}
        active_tab={active_tab}
      />
    )
  },
)
