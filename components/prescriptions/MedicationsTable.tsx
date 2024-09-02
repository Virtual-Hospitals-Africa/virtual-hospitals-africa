import { JSX } from 'preact'

import Table, { TableColumn } from '../library/Table.tsx'

type Medication = {
  condition_name: string
  name: string
  strength_display: string
  form: string
  route: string
  start_date_formatted: string
  schedules_display: string
  special_instructions: string | null
}

const MedicationsTableColumns: TableColumn<Medication>[] = [
  {
    label: 'Condition',
    data: 'condition_name',
  },
  {
    label: 'Medication',
    data: 'name',
  },
  {
    label: 'Form',
    data: 'form',
  },
  {
    label: 'Route',
    data: 'route',
  },
  {
    label: 'Strength',
    data: 'strength_display',
  },
  {
    label: 'Start Date',
    data: 'start_date_formatted',
  },
  {
    label: 'Schedules',
    data: 'schedules_display',
  },
  {
    label: 'Special Instructions',
    data: 'special_instructions',
  },
]

export function MedicationsTable(
  { medications }: { medications: Medication[] },
): JSX.Element {
  return (
    <Table
      columns={MedicationsTableColumns}
      rows={medications}
      EmptyState={() => {
        throw new Error('Medications should not be empty')
      }}
    />
  )
}
