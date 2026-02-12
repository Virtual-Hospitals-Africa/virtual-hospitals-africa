import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../library/FormRow.tsx'
// import { AddMedicineSearch } from '../../islands/medication/Search.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { ArchiveBoxIcon } from '../library/icons/heroicons/outline.tsx'

// TODO: update to use RenderedOrganizationMedication once inventory model is rewritten
// deno-lint-ignore no-explicit-any
type OrganizationMedicine = any

function breakSemicolons(str: string) {
  return (
    <div className='flex flex-col'>
      {str.split('; ').map((name, index) => (
        <span key={name}>
          {name}
          {index === 0 ? '' : ';'}
        </span>
      ))}
    </div>
  )
}

const columns: TableColumn<OrganizationMedicine>[] = [
  {
    label: 'Generic Name',
    data(row) {
      return breakSemicolons(row.generic_name)
    },
  },
  {
    label: 'Trade Name',
    data(row) {
      return breakSemicolons(row.trade_name)
    },
  },
  {
    label: 'Manufacturer',
    data: 'applicant_name',
  },
  {
    label: 'Form',
    data: 'form',
  },
  {
    label: 'Strength',
    data: 'strength_display',
  },
  {
    label: 'Quantity',
    data(row) {
      return row.quantity_on_hand || <span className='text-red-600'>Not in stock</span>
    },
  },
  {
    type: 'actions',
    label: 'Actions',
  },
]

export default function OrganizationMedicinesTable(
  { medicines, organization_id, is_admin }: {
    medicines: OrganizationMedicine[]
    organization_id: string
    is_admin: boolean
  },
) {
  const add_href = `/app/organizations/${organization_id}/inventory/add_medicine`
  return (
    <>
      {is_admin && (
        <FormRow className='mb-2'>
          {/* <AddMedicineSearch organization_id={organization_id} /> */}
          <Button
            type='button'
            href={`/app/organizations/${organization_id}/inventory/add_medicine`}
            className='grid self-end p-2 text-gray-900 border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center'
          >
            Add Medicine
          </Button>
        </FormRow>
      )}
      <Table
        columns={columns}
        rows={medicines}
        EmptyState={() => (
          <EmptyState
            header='No medicines in stock'
            explanation='Add a medicine to get started'
            Icon={ArchiveBoxIcon}
            button={is_admin ? { children: 'Add Medicine', href: add_href } : undefined}
          />
        )}
      />
    </>
  )
}
