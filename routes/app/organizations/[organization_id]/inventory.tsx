import { PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  HasStringId,
  LoggedInHealthWorkerHandlerWithProps,
  Organization,
  RenderedOrganizationConsumable,
  RenderedOrganizationDevice,
  RenderedOrganizationMedicine,
} from '../../../../types.ts'
import * as inventory from '../../../../db/models/inventory.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import InventoryView from '../../../../components/inventory/View.tsx'

type InventoryPageProps = {
  organization: HasStringId<Organization>
  isAdminAtOrganization: boolean
  healthWorker: EmployedHealthWorker
  organization_devices: RenderedOrganizationDevice[]
  organization_consumbales: RenderedOrganizationConsumable[]
  organization_medicines: RenderedOrganizationMedicine[]
  active_tab: string
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  InventoryPageProps,
  {
    organization: HasStringId<Organization>
    isAdminAtOrganization: boolean
    healthWorker: EmployedHealthWorker
  }
> = {
  async GET(_req, ctx) {
    const { healthWorker, organization, isAdminAtOrganization } = ctx.state
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

    return ctx.render({
      organization,
      isAdminAtOrganization,
      healthWorker,
      organization_devices,
      organization_consumbales,
      organization_medicines,
      active_tab,
    })
  },
}

export default function inventoryPage(
  props: PageProps<InventoryPageProps>,
) {
  return (
    <Layout
      variant='health worker home page'
      title='Inventory'
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
    >
      <InventoryView
        organization_id={props.data.organization.id}
        devices={props.data.organization_devices}
        consumables={props.data.organization_consumbales}
        medicines={props.data.organization_medicines}
        isAdmin={props.data.isAdminAtOrganization}
        active_tab={props.data.active_tab}
      />
    </Layout>
  )
}
