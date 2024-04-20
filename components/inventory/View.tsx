import {
  RenderedFacilityConsumable,
  RenderedFacilityDevice,
  RenderedFacilityMedicine,
} from '../../types.ts'
import { Container } from '../library/Container.tsx'
import { TabProps, Tabs } from '../library/Tabs.tsx'
import FacilityConsumablesTable from './ConsumablesTable.tsx'
import FacilityDevicesTable from './DevicesTable.tsx'
import FacilityMedicinesTable from './MedicinesTable.tsx'

export default function inventoryView(
  { devices, consumables, medicines, organization_id, isAdmin, active_tab }: {
    devices: RenderedFacilityDevice[]
    consumables: RenderedFacilityConsumable[]
    medicines: RenderedFacilityMedicine[]
    organization_id: number
    isAdmin: boolean
    active_tab: string
  },
) {
  const tabs: TabProps[] = [
    {
      tab: 'Devices',
      href: `/app/organizations/${organization_id}/inventory?active_tab=devices`,
      active: active_tab === 'devices',
    },
    {
      tab: 'Consumables',
      href: `/app/organizations/${organization_id}/inventory?active_tab=consumables`,
      active: active_tab === 'consumables',
    },
    {
      tab: 'Medicines',
      href: `/app/organizations/${organization_id}/inventory?active_tab=medicines`,
      active: active_tab === 'medicines',
    },
  ]

  return (
    <>
      <Tabs tabs={tabs} />
      <div className='mt-2'>
        {active_tab === 'devices' && (
          <FacilityDevicesTable
            devices={devices}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}

        {active_tab === 'consumables' && (
          <FacilityConsumablesTable
            consumables={consumables}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}

        {active_tab === 'medicines' && (
          <FacilityMedicinesTable
            medicines={medicines}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </>
  )
}
