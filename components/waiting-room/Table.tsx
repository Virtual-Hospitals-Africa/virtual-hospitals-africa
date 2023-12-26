import { RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedWaitingRoom>[] = [
  {
    label: 'Patient',
    dataKey(row) {
      return row.patient.name
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
    label: 'Waiting for',
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
    actions: {
      View(row) {
        return row.patient.href
      },
    },
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
