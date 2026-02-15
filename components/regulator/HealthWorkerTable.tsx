import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Maybe } from '../../types.ts'
import { path } from '../../util/path.ts'

const columns: TableColumn<RenderedRegulatorHealthWorker>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Address',
    data(row) {
      return row.licence.address.formatted
    },
  },
  {
    label: 'License Number',
    data(row) {
      return row.licence.licence_number
    },
  },
  {
    label: 'Expiry Date',
    data(row) {
      return row.licence.expiry_date
    },
  },
  {
    label: 'HealthWorker Type',
    data(row) {
      return row.licence.expiry_date
    },
  },
  // {
  //   label: 'HealthWorker',
  //   data(row) {
  //     return (
  //       <div className='flex flex-col'>
  //         {row.pharmacies.map((pharmacy) => (
  //           <a
  //             key={`${row.id}-${pharmacy.id}`}
  //             href={pharmacy.href}
  //             className='text-indigo-600 hover:text-indigo-900'
  //           >
  //             {pharmacy.name}
  //           </a>
  //         ))}
  //       </div>
  //     )
  //   },
  // },
  {
    label: 'Actions',
    type: 'actions',
  },
]

type HealthWorkersTableProps = {
  country: string
  results: RenderedRegulatorHealthWorker[]
  has_next_page: boolean
  page: number
  search_terms: {
    search?: Maybe<string>
    licence_number?: Maybe<string>
  }
}

export default function HealthWorkersTable({
  country,
  results,
  search_terms,
  page,
  has_next_page,
}: HealthWorkersTableProps): JSX.Element {
  return (
    <Table
      columns={columns}
      rows={results}
      pagination={{ page, has_next_page }}
      EmptyState={() => (
        <EmptyState
          header='No matching health_worker found'
          explanation={[
            `No health_worker matched the search term "${search_terms.licence_number || search_terms.search}"`,
            'If there should be, click below to invite them',
          ]}
          button={{
            children: 'Invite HealthWorker',
            href: path(`/regulator/health_workers/invite`, {
              name: search_terms.search,
              licence_number: search_terms.licence_number,
            }),
          }}
          Icon={UserCircleIcon}
        />
      )}
    />
  )
}
