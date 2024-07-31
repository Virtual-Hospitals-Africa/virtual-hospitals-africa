import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { EmptyState } from '../library/EmptyState.tsx'

import {
  StateUpdater,
  useState,
} from 'https://esm.sh/v128/preact@10.20.1/hooks/src/index.d.ts'
import { InvitePharmacistSearch } from '../../islands/regulator/InvitePharmacistSearch.tsx'

import { Actions, RenderedPharmacist } from '../../types.ts'
import Pagination from '../library/Pagination.tsx'

export type Pharmacist = RenderedPharmacist & {
  actions: Actions
}

const columns: TableColumn<Pharmacist>[] = [
  {
    label: 'Prefix',
    data: 'prefix',
  },
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Address',
    data: 'address',
  },
  {
    label: 'License Number',
    data: 'licence_number',
  },
  {
    label: 'Expiry Date',
    data: 'expiry_date',
  },
  {
    label: 'Pharmacist Type',
    data: 'pharmacist_type',
  },
  {
    label: 'Pharmacy',
    data(row) {
      if (!row.pharmacy) return null
      return (
        <a
          key={`${row.id}-${row.pharmacy.id}`}
          href={row.pharmacy.href}
          className='text-indigo-600 hover:text-indigo-900'
        >
          {row.pharmacy.name}
        </a>
      )
    },
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]
type PharmacistsTableProps = {
  pharmacists: Pharmacist[]
  pathname: string
  totalRows: number
  rowsPerPage: number
  currentPage: number
  totalPage: number
}

export default function PharmacistsTable({
  pharmacists,
  pathname,
  totalRows,
  rowsPerPage,
  currentPage,
  totalPage,
}: PharmacistsTableProps): JSX.Element {
  const invite_href = `/regulator/pharmacists/invite`
  return (
    <>
      <FormRow className='mb-4'>
        <InvitePharmacistSearch />
        <Button
          type='button'
          href={invite_href}
          className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Invite
        </Button>
      </FormRow>
      <Table
        columns={columns}
        rows={pharmacists}
        EmptyState={() => (
          <EmptyState
            header='No pharmacists'
            explanation='Invite a pharmacist to get started'
            Icon={UserCircleIcon}
          />
        )}
      />
      <Pagination
        totalPages={totalPage}
        currentPages={currentPage}
        path={pathname}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
      />
    </>
  )
}
