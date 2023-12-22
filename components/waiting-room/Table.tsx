import { RenderedWaitingRoom } from '../../types.ts'
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
      return row.reason
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
      className='hidden sm:block'
    />
  )
}
