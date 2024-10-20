import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { RenderedPharmacist } from '../../types.ts'
import { path } from '../../util/path.ts'

const columns: TableColumn<RenderedPharmacist>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Address',
    data: 'full_address',
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
      return (
        <div className='flex flex-col'>
          {row.pharmacies.map((pharmacy) => (
            <a
              key={`${row.id}-${pharmacy.id}`}
              href={pharmacy.href}
              className='text-indigo-600 hover:text-indigo-900'
            >
              {pharmacy.name}
            </a>
          ))}
        </div>
      )
    },
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]
type PharmacistsTableProps = {
  results: RenderedPharmacist[]
  has_next_page: boolean
  page: number
  name_search: string | null
  licence_number_search: string | null
}

export default function PharmacistsTable({
  results,
  name_search,
  licence_number_search,
  page,
  has_next_page,
}: PharmacistsTableProps): JSX.Element {
  return (
    <Table
      columns={columns}
      rows={results}
      pagination={{ page, has_next_page }}
      EmptyState={() => (
        <EmptyState
          header='No matching pharmacist found'
          explanation={[
            `No pharmacist matched the search term "${
              name_search || licence_number_search
            }"`,
            'If there should be, click below to invite them',
          ]}
          button={{
            text: 'Invite Pharmacist',
            href: path('/regulator/pharmacists/invite', {
              name: name_search,
              licence_number: licence_number_search,
            }),
          }}
          Icon={UserCircleIcon}
        />
      )}
    />
  )
}
