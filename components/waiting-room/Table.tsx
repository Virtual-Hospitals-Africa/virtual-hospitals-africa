import { RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Person } from '../library/Person.tsx'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedWaitingRoom>[] = [
  {
    label: 'Patient',
    dataKey(row) {
      return <Person person={row.patient} />
    },
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Reason for visit',
    dataKey(row) {
      return capitalize(row.reason)
    },
  },
  {
    label: 'Status',
    dataKey(row) {
      return row.in_waiting_room ? 'Waiting' : 'In Consultation'
    },
  },
  {
    label: 'Provider',
    dataKey(row) {
      if (!row.providers.length) return 'Next Available'
      return row.providers.map((p) => (
        <a key={p.health_worker_id} href={p.href}>{p.name}</a>
      ))
    },
  },
  {
    label: 'Arrived',
    dataKey: 'arrived_ago_display',
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
