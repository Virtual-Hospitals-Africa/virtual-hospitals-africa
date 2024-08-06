import {
  RenderedOrganizationConsumable,
  RenderedOrganizationDevice,
  RenderedOrganizationMedicine,
} from '../../types.ts'
import { TabProps, Tabs } from '../library/Tabs.tsx'
import OrganizationConsumablesTable from './ConsumablesTable.tsx'
import OrganizationDevicesTable from './DevicesTable.tsx'
import OrganizationMedicinesTable from './MedicinesTable.tsx'

export default function inventoryView(
  { devices, consumables, medicines, organization_id, isAdmin, active_tab }: {
    devices: RenderedOrganizationDevice[]
    consumables: RenderedOrganizationConsumable[]
    medicines: RenderedOrganizationMedicine[]
    organization_id: string
    isAdmin: boolean
    active_tab: string
  },
) {
  const tabs: TabProps[] = [
    {
      tab: 'Devices',
      href:
        `/app/organizations/${organization_id}/inventory?active_tab=devices`,
      active: active_tab === 'devices',
    },
    {
      tab: 'Consumables',
      href:
        `/app/organizations/${organization_id}/inventory?active_tab=consumables`,
      active: active_tab === 'consumables',
    },
    {
      tab: 'Medicines',
      href:
        `/app/organizations/${organization_id}/inventory?active_tab=medicines`,
      active: active_tab === 'medicines',
    },
  ]

  return (
    <>
      <Tabs tabs={tabs} />
      <div className='mt-2'>
        {active_tab === 'devices' && (
          <OrganizationDevicesTable
            devices={devices}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}

        {active_tab === 'consumables' && (
          <OrganizationConsumablesTable
            consumables={consumables}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}

        {active_tab === 'medicines' && (
          <OrganizationMedicinesTable
            medicines={medicines}
            organization_id={organization_id}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </>
  )
}
