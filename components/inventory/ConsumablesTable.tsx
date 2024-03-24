import { RenderedFacilityConsumable } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { AddConsumableSearch } from '../../islands/AddConsumableSearch.tsx'

const columns: TableColumn<RenderedFacilityConsumable>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Quantity',
    data(row) {
      return row.quantity_on_hand || (
        <span className='text-red-600'>Not in stock</span>
      )
    },
  },
  {
    type: 'actions',
    label: 'Actions',
  },
]

export default function FacilityConsumablesTable(
  { consumables, facility_id, isAdmin }: {
    consumables: RenderedFacilityConsumable[]
    facility_id: number
    isAdmin: boolean
  },
) {
  return (
    <>
      {isAdmin && (
        <FormRow className='mb-2'>
          <AddConsumableSearch facility_id={facility_id} />
          <Button
            type='button'
            href={`/app/facilities/${facility_id}/inventory/add_consumable`}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Add Consumable
          </Button>
        </FormRow>
      )}

      <Table
        columns={columns}
        rows={consumables}
      />
    </>
  )
}
