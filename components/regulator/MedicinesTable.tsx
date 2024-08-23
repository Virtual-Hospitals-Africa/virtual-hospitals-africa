import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { MedicinesFooInput } from '../../islands/MedicinesFooInput.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { RenderedMedicine } from '../../types.ts'
import Pagination from '../library/Pagination.tsx'

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
        <MedicinesFooInput medicines={medicines} />
        <Button
          type='button'
          href={search_href}
          className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
        >
          Search
        </Button>
      </FormRow>

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
