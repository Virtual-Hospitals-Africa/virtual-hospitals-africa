import { RenderedFacilityDevice } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { AddDeviceSearch } from '../../islands/AddDeviceSearch.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { ArchiveBoxIcon } from '../library/icons/heroicons/outline.tsx'

const columns: TableColumn<RenderedFacilityDevice>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Manufacturer',
    data: 'manufacturer',
  },
  {
    label: 'Serial Number',
    data: 'serial_number',
  },
  {
    label: 'Tests',
    data(row) {
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
  const add_href = `/app/facilities/${facility_id}/inventory/add_device`
  return (
    <>
      {isAdmin && (
        <FormRow className='mb-2'>
          <AddDeviceSearch facility_id={facility_id} />
          <Button
            type='button'
            href={add_href}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Add Device
          </Button>
        </FormRow>
      )}

      <Table
        columns={columns}
        rows={devices}
        EmptyState={() => (
          <EmptyState
            header='No devices in the inventory'
            explanation='Add a device to get started'
            Icon={ArchiveBoxIcon}
            button={isAdmin
              ? { text: 'Add Device', href: add_href }
              : undefined}
          />
        )}
      />
    </>
  )
}
