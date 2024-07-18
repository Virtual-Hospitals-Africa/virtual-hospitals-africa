import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Actions, RenderedPharmacist } from '../../types.ts'

export type Pharmacist = RenderedPharmacist & {
  actions: Actions
}

const columns: TableColumn<Pharmacist>[] = [
  {
    label: 'Prefix',
    data: 'prefix',
  },
  {
    label: 'Given Name',
    data: 'given_name',
  },
  {
    label: 'Family Name',
    data: 'family_name',
  },
  {
    label: 'Address',
    data: 'address',
  },
  {
    label: 'Town',
    data: 'town',
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
}

export default function PharmacistsTable({
  pharmacists,
  pathname,
}: PharmacistsTableProps): JSX.Element {
  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        <Button
          type='button'
          href={`${pathname}/invite`}
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
    </>
  )
}
