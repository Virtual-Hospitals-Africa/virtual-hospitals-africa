import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { BriefcaseIcon } from '../library/icons/heroicons/outline.tsx'
import Badge from '../library/Badge.tsx'
import type { RenderedEmploymentRow } from '../../types.ts'

export default function EmploymentTable({ rows }: { rows: RenderedEmploymentRow[] }): JSX.Element {
  const columns: TableColumn<RenderedEmploymentRow>[] = [
    {
      label: 'Health Worker',
      data(row) {
        return (
          <a
            href={`/app/organizations/${row.organization_id}/employees/${row.health_worker_id}`}
            class='text-indigo-600 hover:text-indigo-900 font-medium'
          >
            {row.health_worker_name}
          </a>
        )
      },
    },
    {
      label: 'Organization',
      data(row) {
        return (
          <a href={`/app/organizations/${row.organization_id}`} class='text-indigo-600 hover:text-indigo-900'>
            {row.organization_name}
          </a>
        )
      },
    },
    {
      label: 'Role',
      data: 'role',
    },
    {
      label: 'Admin',
      data(row) {
        return row.is_admin ? <Badge color='green' content='Yes' /> : null
      },
    },
    {
      label: 'Seniority',
      data: 'seniority_order',
    },
    {
      label: 'Created',
      type: 'date',
      data: 'created_at',
    },
  ]

  return (
    <Table
      columns={columns}
      rows={rows}
      EmptyState={() => (
        <EmptyState
          header='No employment records'
          explanation='No employment records match your search'
          Icon={BriefcaseIcon}
        />
      )}
    />
  )
}
