import { RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Person } from '../library/Person.tsx'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedWaitingRoom>[] = [
  {
    label: 'Patient',
    headerClassName: 'pl-12',
    data(row) {
      return <Person person={row.patient} />
    },
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Reason for visit',
    data(row) {
      return capitalize(row.reason)
    },
  },
  {
    label: 'Status',
    data: 'status',
  },
  {
    label: 'Providers',
    data(row) {
      if (!row.providers.length) return 'Next Available'
      return (
        <div className='flex flex-col'>
          {row.providers.map((p) => (
            <a key={p.health_worker_id} href={p.href}>{p.name}</a>
          ))}
        </div>
      )
    },
  },
  {
    label: 'Reviewers',
    data(row) {
      if (!row.reviewers.length) return null
      return (
        <div className='flex flex-col'>
          {row.reviewers.map((p) => (
            <a key={p.health_worker_id} href={p.href}>{p.name}</a>
          ))}
        </div>
      )
    },
  },
  {
    label: 'Arrived',
    data: 'arrived_ago_display',
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]

export default function WaitingRoomTable(
  { waiting_room }: { waiting_room: RenderedWaitingRoom[] },
) {
  return (
    <Table
      columns={columns}
      rows={waiting_room}
    />
  )
}
