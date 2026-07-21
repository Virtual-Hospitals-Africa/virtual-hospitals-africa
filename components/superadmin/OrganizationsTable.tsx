import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { RenderedOrganization } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { BuildingOffice2Icon } from '../library/icons/heroicons/outline.tsx'
import Badge from '../library/Badge.tsx'

export default function OrganizationsTable({ organizations }: { organizations: RenderedOrganization[] }): JSX.Element {
  const columns: TableColumn<RenderedOrganization>[] = [
    {
      label: 'Name',
      data(row) {
        return (
          <a href={`/app/organizations/${row.id}`} class='text-indigo-600 hover:text-indigo-900 font-medium'>
            {row.name}
          </a>
        )
      },
    },
    {
      label: 'Category',
      data: 'category',
    },
    {
      label: 'Country',
      data: 'country',
    },
    {
      label: 'Address',
      data: 'formatted_address',
    },
    {
      label: 'Ownership',
      data: 'ownership',
    },
    {
      label: 'Test',
      data(row) {
        return row.is_test ? <Badge color='purple' content='Test' /> : null
      },
    },
    {
      label: 'Actions',
      type: 'actions',
      data(row) {
        return { text: 'Dashboard', href: `/app/organizations/${row.id}/dashboard` }
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={organizations}
      EmptyState={() => (
        <EmptyState
          header='No organizations'
          explanation='No organizations match your search'
          Icon={BuildingOffice2Icon}
        />
      )}
    />
  )
}
