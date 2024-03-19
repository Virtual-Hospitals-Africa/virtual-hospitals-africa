import { RenderedInventoryHistory } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import { Container } from '../library/Container.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'

export default function InventoryHistoryTable(
  { details, facility_id, consumable_id }: {
    details: RenderedInventoryHistory[]
    facility_id: number
    consumable_id: number
  },
) {
  const columns: TableColumn<RenderedInventoryHistory>[] = [
    {
      label: 'Date',
      data(row) {
        return (
          <div>
            {row.created_at.toLocaleString()}
          </div>
        )
      },
    },
    {
      label: 'Procurer',
      data: 'procured_by',
    },
    {
      label: 'Employee/Consumer',
      data: 'created_by',
    },
    {
      label: 'Added',
      data(row) {
        return (
          <div>
            {!row.consumption_id
              ? (
                <span class='text-green-400'>
                  + {row.quantity}
                </span>
              )
              : '-'}
          </div>
        )
      },
    },
    {
      label: 'Consumed',
      data(row) {
        return (
          <div>
            {row.consumption_id
              ? (
                <span class='text-red-400'>
                  - {row.quantity ?? 0}
                </span>
              )
              : (
                row.quantity === row.consumed_amount
                  ? <span class='text-yellow-400'>Out of stock</span>
                  : (
                    <a
                      href={`/app/facilities/${facility_id}/inventory/consume?procurement_id=${row.procurement_id}&consumable_id=${consumable_id}`}
                      class='text-indigo-600 hover:text-indigo-900 capitalize'
                    >
                      {row.consumed_amount ?? 0}
                    </a>
                  )
              )}
          </div>
        )
      },
    },
    {
      label: 'Expire in',
      data(row) {
        return (
          <div>
            {!row.consumption_id
              ? (row.expiry_date?.toLocaleDateString() ?? 'No Expiration')
              : '-'}
          </div>
        )
      },
    },
  ]

  return (
    <Container size='lg'>
      <FormRow>
        <div class='mb-2'>
          <Button
            type='button'
            href={`/app/facilities/${facility_id}/inventory?active_tab=consumables`}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Back
          </Button>
        </div>
      </FormRow>

      <Table
        columns={columns}
        rows={details}
      />
    </Container>
  )
}
