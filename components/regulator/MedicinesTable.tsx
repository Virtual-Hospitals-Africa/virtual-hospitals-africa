import Table, { TableColumn } from '../library/Table.tsx'
import { RenderedManufacturedMedication } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { path } from '../../util/path.ts'
import { Plussable } from '../library/icons/Plussable.tsx'
import { MedicineIcon } from '../library/icons/Medicines.tsx'

const columns: TableColumn<RenderedManufacturedMedication>[] = [
  {
    label: 'Generic Name',
    data: 'name',
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
  {
    label: 'Actions',
    type: 'actions',
  },
]

type MedicinesTableProps = {
  results: RenderedManufacturedMedication[]
  page: number
  has_next_page: boolean
  search: string | null
}

export function MedicinesTable(
  { results, page, has_next_page, search }: MedicinesTableProps,
) {
  return (
    <Table
      columns={columns}
      rows={results}
      pagination={{ page, has_next_page }}
      EmptyState={() => (
        <EmptyState
          header='No matching medicine found'
          explanation={[
            `No medicine matched the search term "${search}"`,
            'If there should be, click below to add it',
          ]}
          // TODO: create /regulator/medicines/add page
          button={{
            text: 'Add Medicine',
            href: path('/regulator/medicines/add', {
              name: search,
            }),
          }}
          icon={<Plussable Icon={MedicineIcon} />}
        />
      )}
    />
  )
}
