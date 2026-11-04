import { RenderedWaitingRoom } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import PriorityBadge from '../PriorityBadge.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { Person, PersonData } from '../library/Person.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import Card from '../library/Card.tsx'
import { ActionButton } from '../library/ActionButton.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { ComponentChildren } from 'preact'

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

function isEmptyValue(value: unknown): boolean {
  return value == null || value === false || (Array.isArray(value) && value.length === 0)
}

function cellValue(
  column: TableColumn<RenderedWaitingRoom>,
  row: RenderedWaitingRoom,
  index: number,
  rows: RenderedWaitingRoom[],
): unknown {
  const data = column.data as unknown
  if (typeof data === 'function') {
    return (data as (row: RenderedWaitingRoom, index: number, rows: RenderedWaitingRoom[]) => unknown)(row, index, rows)
  }
  return row[data as keyof RenderedWaitingRoom]
}

function renderCellValue(column: TableColumn<RenderedWaitingRoom>, value: unknown): ComponentChildren {
  if (typeof value === 'string') return value
  if (column.type === 'date') {
    return <LocalTime timestamp={value as Date} expected_time_range='any' />
  }
  if (column.type === 'person') {
    return [value].flat().map((person) => (
      <Person key={(person as PersonData).id || (person as PersonData).name} person={person as PersonData} />
    ))
  }
  return value as ComponentChildren
}

function WaitingRoomCard(
  { row, index, rows }: {
    row: RenderedWaitingRoom
    index: number
    rows: RenderedWaitingRoom[]
  },
) {
  return (
    <Card orientation='vertical'>
      <div className='flex flex-col gap-2'>
        {columns.filter((column) => column.type !== 'actions').map((column) => {
          const raw = cellValue(column, row, index, rows)
          const value = isEmptyValue(raw) ? column.fallback : raw
          console.log('value', value, 'raw', raw, 'column', column.label)
          if (isEmptyValue(value)) return null
          return (
            <div key={column.label} className='flex flex-col'>
              <span className='text-xs text-gray-500'>{column.label}</span>
              <div className='text-sm text-gray-900'>{renderCellValue(column, value)}</div>
            </div>
          )
        })}
      </div>
      {row.actions.length > 0 && (
        <div className='flex flex-col gap-1'>
          {row.actions.map((action) => <ActionButton key={action.text} action={action} />)}
        </div>
      )}
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
        {waiting_room.map((row, index) => (
          <WaitingRoomCard
            key={row.patient_encounter_id}
            row={row}
            index={index}
            rows={waiting_room}
          />
        ))}
      </div>
    </>
  )
}
