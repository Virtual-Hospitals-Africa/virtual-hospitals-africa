import {
  RenderedFacilityConsumable,
  RenderedFacilityDevice,
} from '../../types.ts'
import { Container } from '../library/Container.tsx'
import { TabProps, Tabs } from '../library/Tabs.tsx'
import FacilityConsumablesTable from './ConsumablesTable.tsx'
import FacilityDevicesTable from './DevicesTable.tsx'

export default function inventoryView(
  { devices, consumables, facility_id, isAdmin, active_tab }: {
    devices: RenderedFacilityDevice[]
    consumables: RenderedFacilityConsumable[]
    facility_id: number
    isAdmin: boolean
    active_tab: string
  },
) {
  const tabs: TabProps[] = [
    {
      tab: 'Devices',
      href: `/app/facilities/${facility_id}/inventory?active_tab=devices`,
      active: active_tab === 'devices',
    },
    {
      tab: 'Consumables',
      href: `/app/facilities/${facility_id}/inventory?active_tab=consumables`,
      active: active_tab === 'consumables',
    },
    {
      tab: 'Medicines',
      href: `/app/facilities/${facility_id}/inventory?active_tab=medicines`,
      active: active_tab === 'medicines',
    },
  ]

  return (
    <>
      <Tabs tabs={tabs} />
      <Container size='lg'>
        {active_tab === 'devices' && (
          <FacilityDevicesTable
            devices={devices}
            facility_id={facility_id}
            isAdmin={isAdmin}
          />
        )}

        {active_tab === 'consumables' && (
          <FacilityConsumablesTable
            consumables={consumables}
            facility_id={facility_id}
            isAdmin={isAdmin}
          />
        )}
      </Container>
    </>
  )
}
