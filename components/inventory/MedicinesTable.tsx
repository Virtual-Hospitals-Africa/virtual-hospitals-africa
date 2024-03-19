import { RenderedFacilityMedicine } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'

const columns: TableColumn<RenderedFacilityMedicine>[] = [
  {
    label: 'Trade Name',
    data: 'trade_name',
  },
  {
    label: 'Manufacturer',
    data: 'manufacturer_name',
  },
  {
    label: 'Quantity',
    data: 'quantity_on_hand',
  },
  {
    label: 'History',
    data(row) {
      return (
        <div>
          <Button>View</Button>
        </div>
      )
    },
  },
]

export default function FacilityMedicinesTable(
  { medicines, facility_id, isAdmin }: {
    medicines: RenderedFacilityMedicine[]
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
              href={`/app/facilities/${facility_id}/inventory/add_medicine`}
              className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
            >
              Add Medicine
            </Button>
          </div>
        </FormRow>
      )}

      <Table
        columns={columns}
        rows={medicines}
      />
    </>
  )
}
