import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { Person } from '../library/Person.tsx'
import { RenderedHealthWorker } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { UserGroupIcon } from '../library/icons/heroicons/outline.tsx'

export default function HealthWorkersTable({ health_workers }: { health_workers: RenderedHealthWorker[] }): JSX.Element {
  const columns: TableColumn<RenderedHealthWorker>[] = [
    {
      label: 'Health Worker',
      data(row) {
        const primary_org = row.organizations[0]
        const href = primary_org ? `/app/organizations/${primary_org.id}/employees/${row.id}` : undefined
        return <Person person={{ ...row, display_name: row.name, href }} />
      },
    },
    {
      label: 'Email',
      data: 'email',
    },
    {
      label: 'Organizations',
      data(row) {
        return (
          <div class='flex flex-col gap-1'>
            {row.organizations.map((o) => (
              <a key={o.id} href={`/app/organizations/${o.id}`} class='text-indigo-600 hover:text-indigo-900 text-sm'>
                {o.name}
              </a>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={health_workers}
      EmptyState={() => (
        <EmptyState
          header='No health workers'
          explanation='No health workers match your search'
          Icon={UserGroupIcon}
        />
      )}
    />
  )
}
