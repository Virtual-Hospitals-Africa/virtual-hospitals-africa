import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Maybe, Organization } from '../../types.ts'
import { path } from '../../util/path.ts'
import { BuildingOfficeIcon } from '../library/icons/heroicons/outline.tsx'
import { Plussable } from '../library/icons/Plussable.tsx'

type RenderedOrganization = Organization & {
  id: string
  name: string
  category: string | null
  address: string | null
  departments: {
    id: string
    name: string
    accepts_patients: boolean
  }[]
}

const columns: TableColumn<RenderedOrganization>[] = [
  {
    label: 'Name',
    data: 'name',
  },
  {
    label: 'Category',
    data: 'category',
  },
  {
    label: 'Address',
    data: 'address',
  },
  {
    label: 'Departments',
    data(row) {
      if (!row.departments || row.departments.length === 0) return null
      return (
        <div className='flex flex-col gap-1'>
          {row.departments.map((dept) => (
            <span key={dept.id} className='text-sm'>
              {dept.name}
              {dept.accepts_patients && (
                <span className='ml-1 text-xs text-green-600'>(Patients)</span>
              )}
            </span>
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

type OrganizationsTableProps = {
  country: string
  results: RenderedOrganization[]
  has_next_page: boolean
  page: number
  search_terms: {
    country?: string
    name_search?: Maybe<string>
  }
}

export function OrganizationsTable(
  { country, results, has_next_page, page, search_terms }:
    OrganizationsTableProps,
) {
  return (
    <Table
      columns={columns}
      rows={results.map((org) => ({
        ...org,
        href: `/regulator/${country}/organizations/${org.id}`,
        actions: [
          {
            label: 'View',
            href: `/regulator/${country}/organizations/${org.id}`,
          },
          {
            label: 'Edit',
            href: `/regulator/${country}/organizations/${org.id}/edit`,
          },
        ],
      }))}
      pagination={{ page, has_next_page }}
      EmptyState={() => (
        <EmptyState
          header='No organizations found'
          explanation={[
            search_terms.name_search
              ? `No organizations matched the search term "${search_terms.name_search}"`
              : 'No organizations found for this country',
            'Click below to add a new organization',
          ]}
          button={{
            children: 'Add Organization',
            href: path(`/regulator/${country}/organizations/add`, {}),
          }}
          icon={<Plussable Icon={BuildingOfficeIcon} />}
        />
      )}
    />
  )
}
