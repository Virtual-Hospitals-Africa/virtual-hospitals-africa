import { FacilityDeviceTable } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<FacilityDeviceTable>[] = [
  {
    label: 'Device Serial',
    dataKey: 'serial',
  },
  {
    label: 'Name',
    dataKey: 'name',
  },
  {
    label: 'Manufacturer',
    dataKey: 'manufacturer',
  },
  {
    label: 'Tests',
    dataKey(row) {
      return (
        <div className='flex flex-col'>
          {row.test_availability.map((p) => <span>{p.name}</span>)}
        </div>
      )
    },
  },
]

export default function FacilityDevicesTable(
  { devices }: { devices: FacilityDeviceTable[] },
) {
  return (
    <Table
      columns={columns}
      rows={devices}
    />
  )
}
