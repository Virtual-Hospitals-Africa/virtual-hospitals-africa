import { RenderedFacilityDevice } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../library/form/Row.tsx'

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
  { devices, facility_id, isAdmin }: {
    devices: RenderedFacilityDevice[]
    facility_id: number
    isAdmin: boolean
  },
) {
  return (
    <>
      {isAdmin && (
        <FormRow>
          <div class='mb-2'>
            <Button
              type='button'
              href={`/app/facilities/${facility_id}/inventory/add_device`}
              className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
            >
              Add Device
            </Button>
          </div>
        </FormRow>
      )}

      <Table
        columns={columns}
        rows={devices}
      />
    </>
  )
}
