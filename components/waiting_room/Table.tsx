import { RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import PriorityBadge from '../PriorityBadge.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Person } from '../library/Person.tsx'
import Table, {
  ColumnWithContents,
  columnsWithSomeNonNullValue,
  TableCellInnerContents,
  TableColumn,
} from '../library/Table.tsx'
import Card from '../library/Card.tsx'

const columns: TableColumn<RenderedWaitingRoom>[] = [
  {
    label: 'Patient',
    // headerClassName: 'pl-12',
    data(row) {
      return <Person person={row.patient} no_avatar />
    },
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Reason for visit',
    data(row) {
      return row.reason ? capitalize(row.reason) : 'Undetermined'
    },
  },
  {
    label: 'Status',
    data: 'workflow_status_display',
  },
  {
    label: 'Location',
    data(row) {
      return row.room.name
    },
  },
  // {
  //   label: 'Department',
  //   data: 'department_name',
  // },
  {
    label: 'Employees',
    type: 'person',
    fallback: 'Next Available',
    data(row) {
      return row.present_employees.map((employee) => (
        {
          ...employee,
          ...employeeDisplay(employee),
        }
      ))
    },
  },
  {
    label: 'Priority',
    data({ priority }) {
      if (!priority) return null
      return <PriorityBadge priority={priority.name} />
    },
  },
  // {
  //   label: 'Reviewers',
  //   data(row) {
  //     if (!row.reviewers.length) return null
  //     return (
  //       <div className='flex flex-col'>
  //         {row.reviewers.map((p) => (
  //           <a key={p.health_worker_id} href={p.href}>{p.name}</a>
  //         ))}
  //       </div>
  //     )
  //   },
  // },
  {
    label: 'Target time',
    type: 'date',
    data: ({ priority }) => {
      return priority?.target_treatment_time
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

function WaitingRoomEmptyState({ can_register_patients }: { can_register_patients: boolean }) {
  return (
    <EmptyState
      header='No patients present at the facility'
      explanation={can_register_patients
        ? [
          'Use the search bar above to intake returning patients',
          'or the button to the right to register new patients.',
        ]
        : [
          'When patients go through intake, they will appear here',
        ]}
    />
  )
}

function WaitingRoomCard(
  { row, row_index, columns_with_contents }: {
    row: RenderedWaitingRoom
    row_index: number
    columns_with_contents: ColumnWithContents<RenderedWaitingRoom>[]
  },
) {
  return (
    <Card orientation='vertical'>
      <div className='flex flex-col gap-2'>
        {columns_with_contents.filter((column) => column.type !== 'actions').map((column) => (
          <div key={column.label} className='flex flex-col'>
            <span className='text-xs text-gray-500'>{column.label}</span>
            <TableCellInnerContents row={row} row_index={row_index} column={column} />
          </div>
        ))}
      </div>
      {columns_with_contents.filter((column) => column.type === 'actions').map((column) => (
        <TableCellInnerContents key={column.label} row={row} row_index={row_index} column={column} />
      ))}
    </Card>
  )
}

export default function WaitingRoomTable(
  { waiting_room, can_register_patients }: {
    waiting_room: RenderedWaitingRoom[]
    can_register_patients: boolean
  },
) {
  if (waiting_room.length === 0) {
    return <WaitingRoomEmptyState can_register_patients={can_register_patients} />
  }

  const columns_with_contents = [...columnsWithSomeNonNullValue({ columns, rows: waiting_room })]

  return (
    <>
      <Table
        id='waiting-room-table'
        className='hidden md:block'
        columns={columns}
        rows={waiting_room}
        EmptyState={() => <WaitingRoomEmptyState can_register_patients={can_register_patients} />}
      />
      <div className='flex flex-col gap-3 md:hidden'>
        {waiting_room.map((row, row_index) => (
          <WaitingRoomCard
            key={row.patient_encounter_id}
            row={row}
            row_index={row_index}
            columns_with_contents={columns_with_contents}
          />
        ))}
      </div>
    </>
  )
}
