import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { RenderedPharmacy } from '../../types.ts'
import { Person } from '../library/Person.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { path } from '../../util/path.ts'

const columns: TableColumn<RenderedPharmacy>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Address',
    data: 'address_display',
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
          {row.supervisors.map((s) => <Person key={s.id} person={s} />)}
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
  results: RenderedPharmacy[]
  has_next_page: boolean
  page: number
  search_terms: {
    name_search: string | null
    licence_number_search: string | null
  }
}

export function PharmaciesTable(
  { results, search_terms, page, has_next_page }: PharmaciesTableProps,
): JSX.Element {
  return (
    <Table
      columns={columns}
      rows={results}
      pagination={{ page, has_next_page }}
      EmptyState={() => (
        <EmptyState
          header='No matching pharmacy found'
          explanation={[
            `No pharmacy matched the search term "${
              search_terms.name_search || search_terms.licence_number_search
            }"`,
            'If there should be, click below to add it',
          ]}
          button={{
            children: 'Add Pharmacy',
            href: path('/regulator/pharmacies/add', {
              name: search_terms.name_search,
              licence_number: search_terms.licence_number_search,
            }),
          }}
          Icon={UserCircleIcon}
        />
      )}
    />
  )
}
