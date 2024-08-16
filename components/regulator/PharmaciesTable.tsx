import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { RenderedPharmacy } from '../../types.ts'
import Pagination from '../library/Pagination.tsx'
import { Person } from '../library/Person.tsx'
import { InvitePharmacySearch } from '../../islands/regulator/InvitePharmacySearch.tsx'

type Pharmacy = {
  address: string | null
  expiry_date: string
  licence_number: string
  licensee: string
  name: string
  pharmacies_types: RenderedPharmacy
  town: string | null
}

const columns: TableColumn<RenderedPharmacy>[] = [
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
    label: 'Licensee',
    data: 'licensee',
  },
  {
    label: 'Pharmacy Type',
    data: 'pharmacies_types',
  },
  {
    label: 'Supervisor',
    data(row) {
      if (!row.supervisors || row.supervisors.length === 0) return null
      return (
        <div className='flex flex-wrap gap-2'>
          {row.supervisors.map((s) => <Person person={s} />)}
        </div>
      )
    },
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]

type PharmaciesTableProps = {
  pharmacies: RenderedPharmacy[]
  pathname: string
  totalRows: number
  rowsPerPage: number
  currentPage: number
  totalPage: number
}

export default function PharmaciesTable({
  pharmacies,
  pathname,
  totalRows,
  rowsPerPage,
  currentPage,
  totalPage,
}: PharmaciesTableProps): JSX.Element {
  const search_href = `${pathname}`
  const add_href = `${pathname}/add`
  return (
    <>
      <FormRow className='mb-4'>
        <InvitePharmacySearch />
        <Button
          type='button'
          href={add_href}
          className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Add
        </Button>
      </FormRow>
      <Table
        columns={columns}
        rows={pharmacies}
        EmptyState={() => (
          <EmptyState
            header='No pharmacies'
            explanation='Add a pharmacy to get started'
            button={{ text: 'Add Pharmacy', href: add_href }}
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
