import { JSX } from 'preact'
import { MedicinesSearchInput } from '../../islands/MedicinesSearchInput.tsx'
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
  return (
    <>
      <MedicinesSearchInput
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
