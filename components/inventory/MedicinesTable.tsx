import { RenderedFacilityMedicine } from '../../types.ts'
import { Button } from '../library/Button.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { AddMedicineSearch } from '../../islands/manufactured_medication/Search.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { ArchiveBoxIcon } from '../library/icons/heroicons/outline.tsx'

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

const columns: TableColumn<RenderedFacilityMedicine>[] = [
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

export default function FacilityMedicinesTable(
  { medicines, facility_id, isAdmin }: {
    medicines: RenderedFacilityMedicine[]
    facility_id: number
    isAdmin: boolean
  },
) {
  const add_href = `/app/facilities/${facility_id}/inventory/add_medicine`
  return (
    <>
      {isAdmin && (
        <FormRow className='mb-2'>
          <AddMedicineSearch facility_id={facility_id} />
          <Button
            type='button'
            href={`/app/facilities/${facility_id}/inventory/add_medicine`}
            className='w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
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
            button={isAdmin
              ? { text: 'Add Medicine', href: add_href }
              : undefined}
          />
        )}
      />
    </>
  )
}
