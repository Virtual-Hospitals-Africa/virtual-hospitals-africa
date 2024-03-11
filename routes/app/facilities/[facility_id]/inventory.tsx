import { FreshContext, PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  Facility,
  HasId,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedFacilityDevice,
  RenderedFacilityConsumable,
} from '../../../../types.ts'
import * as inventory from '../../../../db/models/inventory.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { assertOr404 } from '../../../../util/assertOr.ts'
import InventoryView from '../../../../components/inventory/View.tsx'

type InventoryPageProps = {
  facility: HasId<Facility>
  isAdminAtFacility: boolean
  healthWorker: EmployedHealthWorker
  facility_devices: RenderedFacilityDevice[]
  facility_consumbales: RenderedFacilityConsumable[]
  active_tab: string
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  InventoryPageProps,
  {
    facility: HasId<Facility>
    isAdminAtFacility: boolean
    healthWorker: EmployedHealthWorker
  }
> = {
  async GET(_req, ctx) {
    const { healthWorker, facility, isAdminAtFacility } = ctx.state
    const facility_id = parseInt(ctx.params.facility_id)
    const active_tab = ctx.url.searchParams.get('active_tab') ?? 'devices'
    assertOr404(facility_id)

    const facility_devices = active_tab === 'devices'
      ? await inventory.getFacilityDevices(
        ctx.state.trx,
        { facility_id: facility_id },
      )
      : []

    const facility_consumbales = active_tab === 'consumables'
      ? await inventory.getFacilityConsumables(
        ctx.state.trx,
        { facility_id: facility_id },
      )
      : []

    return ctx.render({
      facility,
      isAdminAtFacility,
      healthWorker,
      facility_devices,
      facility_consumbales,
      active_tab
    })
  },
}

export default function inventoryPage(
  props: PageProps<InventoryPageProps>,
) {
  return (
    <Layout
      variant='home page'
      title='Inventory'
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
    >
      <InventoryView
        facility_id={props.data.facility.id}
        devices={props.data.facility_devices}
        consumables={props.data.facility_consumbales}
        isAdmin={props.data.isAdminAtFacility}
        active_tab={props.data.active_tab}
      />
    </Layout>
  )
}
