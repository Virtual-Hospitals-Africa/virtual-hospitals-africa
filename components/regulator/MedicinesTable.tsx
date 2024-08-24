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
  searchQuery: string
}

export default function MedicinesTable({
  medicines,
  pathname,
  totalRows,
  rowsPerPage,
  currentPage,
  totalPage,
  searchQuery,
}: MedicinesTableProps): JSX.Element {
  const search_href = `${pathname}`
  const add_href = `${pathname}/add`
  return (
    <>
      <MedicinesFooInput 
        medicines={medicines}
        searchQuery={searchQuery}
      />

      <Pagination
        totalPages={totalPage}
        currentPages={currentPage}
        path={pathname}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        searchQuery={searchQuery}
      />
    </>
  )
}
