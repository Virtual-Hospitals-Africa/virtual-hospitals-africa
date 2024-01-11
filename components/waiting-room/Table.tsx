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
    type: 'content',
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Reason for visit',
    dataKey(row) {
      return capitalize(row.reason)
    },
    type: 'content',
  },
  {
    label: 'Status',
    type: 'content',
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
    type: 'content',
  },
  {
    label: 'Arrived',
    dataKey(row) {
      return 'Just now' // TODO: implement this
    },
    type: 'content',
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
