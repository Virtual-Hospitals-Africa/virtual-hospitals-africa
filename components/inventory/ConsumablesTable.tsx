import { RenderedOrganizationConsumable } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../library/FormRow.tsx'
import { AddConsumableSearch } from '../../islands/AddConsumableSearch.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { ArchiveBoxIcon } from '../library/icons/heroicons/outline.tsx'

const columns: TableColumn<RenderedOrganizationConsumable>[] = [
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

export default function OrganizationConsumablesTable(
  { consumables, organization_id, isAdmin }: {
    consumables: RenderedOrganizationConsumable[]
    organization_id: string
    isAdmin: boolean
  },
) {
  const add_href =
    `/app/organizations/${organization_id}/inventory/add_consumable`
  return (
    <>
      {isAdmin && (
        <FormRow className='mb-2'>
          <AddConsumableSearch organization_id={organization_id} />
          <Button
            type='button'
            href={add_href}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Add Consumable
          </Button>
        </FormRow>
      )}

      <Table
        columns={columns}
        rows={consumables}
        EmptyState={() => (
          <EmptyState
            header='No consumables in stock'
            explanation='Add a consumable to get started'
            Icon={ArchiveBoxIcon}
            button={isAdmin
              ? { children: 'Add Consumable', href: add_href }
              : undefined}
          />
        )}
      />
    </>
  )
}
