import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { RenderedMedicine } from '../../types.ts'
import Pagination from '../library/Pagination.tsx'

const columns: TableColumn<RenderedMedicine>[] = [
  {
    label: 'Generic Name',
    data: 'generic_name',
  },
  {
    label: 'Trade Name',
    data: 'trade_name',
  },
  {
    label: 'Applicant Name',
    data: 'applicant_name',
  },
  {
    label: 'Form',
    data: 'form',
  },
  {
    label: 'Strength Summary',
    data: 'strength_summary',
  },
]

type MedicinesTableProps = {
  medicines: RenderedMedicine[]
  pathname: string
  totalRows: number
  rowsPerPage: number
  currentPage: number
  totalPage: number
}

export default function MedicinesTable({
  medicines,
  pathname,
  totalRows,
  rowsPerPage,
  currentPage,
  totalPage,
}: MedicinesTableProps): JSX.Element {
  const search_href = `${pathname}`
  const add_href = `${pathname}/add`
  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        <Button
          type='button'
          href={search_href}
          className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Search
        </Button>
      </FormRow>
      <Table
        columns={columns}
        rows={medicines}
        EmptyState={() => (
          <EmptyState
            header='No medicines'
            explanation='Add a medicine to get started'
            button={{ text: 'Add Medicine', href: add_href }}
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
