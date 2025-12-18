import { PRIORITY_COLORS, RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import cls from '../../util/cls.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import Badge from '../library/Badge.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Person } from '../library/Person.tsx'
import Table, { TableColumn } from '../library/Table.tsx'

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
      return row.reason ? capitalize(row.reason) : 'Reason not yet determined'
    },
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
    label: 'Status',
    data: 'workflow_status_display',
  },
  {
    label: 'Priority',
    data(row) {
      if (!row.priority_level) return null
      const colors = PRIORITY_COLORS[row.priority_level]
      return (
        <Badge
          content={row.priority_level}
          classNames={cls(colors.bg, colors.text)}
        />
      )
    },
  },
  {
    label: 'Employees',
    data(row) {
      if (!row.present_employees.length) return 'Next Available'
      return (
        <div className='flex flex-col'>
          {row.present_employees.map((employee) => (
            <Person
              key={employee.id}
              person={{
                ...employee,
                ...employeeDisplay(employee),
              }}
            />
          ))}
        </div>
      )
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
    label: 'Arrived',
    data: 'arrived_ago_display',
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]

export default function WaitingRoomTable(
  { waiting_room, can_register_patients }: {
    waiting_room: RenderedWaitingRoom[]
    can_register_patients: boolean
  },
) {
  return (
    <Table
      columns={columns}
      rows={waiting_room}
      EmptyState={() => (
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
      )}
    />
  )
}
