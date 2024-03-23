import { RenderedFacilityMedicine } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'

export default function FacilityMedicinesTable(
  { medicines, facility_id, isAdmin }: {
    medicines: RenderedFacilityMedicine[]
    facility_id: number
    isAdmin: boolean
  },
) {
  const columns: TableColumn<RenderedFacilityMedicine>[] = [
    {
      label: 'Drug Generic Name',
      data: 'generic_name',
    },
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
      data(row) {
        return (
          <div>
            {row.quantity_on_hand}
          </div>
        )
      },
    },
    {
      label: 'Actions',
      data(row) {
        return (
          <div>
            <a
              href={`/app/facilities/${facility_id}/inventory/history?consumable_id=${row.consumable_id}&active_tab=medicines`}
              class='text-indigo-600 hover:text-indigo-900 capitalize'
            >
              Details
            </a>
          </div>
        )
      },
    },
  ]

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
