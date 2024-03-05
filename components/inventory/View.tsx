import { RenderedFacilityDevice } from '../../types.ts'
import { Container } from '../library/Container.tsx'
import { TabProps, Tabs } from '../library/Tabs.tsx'
import FacilityDevicesTable from './DevicesTable.tsx'

export default function inventoryView(
  { devices, facility_id }: {
    devices: RenderedFacilityDevice[]
    facility_id: number
  },
) {
  const tabs: TabProps[] = [
    {
      tab: 'Devices',
      href: `/app/inventory`,
      active: true,
    },
    {
      tab: 'Consumables',
      href: `/app/inventory`,
      active: false,
    },
    {
      tab: 'Medicines',
      href: `/app/inventory`,
      active: false,
    },
  ]

  return (
    <>
      <Tabs tabs={tabs} />
      <Container size='lg'>
        <FacilityDevicesTable
          devices={devices}
          facility_id={facility_id}
        />
      </Container>
    </>
  )
}
