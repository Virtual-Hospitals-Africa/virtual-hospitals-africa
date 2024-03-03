import { RenderedFacilityDevice } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedFacilityDevice>[] = [
  {
    label: 'Name',
    dataKey: 'name',
  },
  {
    label: 'Manufacturer',
    dataKey: 'manufacturer',
  },
  {
    label: 'Serial Number',
    dataKey: 'serial_number',
  },
  {
    label: 'Tests',
    dataKey(row) {
      return (
        <div className='flex flex-col'>
          {row.diagnostic_test_capabilities.map((c) => <span>{c}</span>)}
        </div>
      )
    },
  },
]

export default function FacilityDevicesTable(
  { devices }: { devices: RenderedFacilityDevice[] },
) {
  return (
    <Table
      columns={columns}
      rows={devices}
    />
  )
}
