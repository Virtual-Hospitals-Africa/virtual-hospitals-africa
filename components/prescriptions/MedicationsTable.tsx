import { JSX } from 'preact'

import Table, { TableColumn } from '../library/Table.tsx'
import { PrescriptionMedication } from '../../types.ts'
import { scheduleDisplay, strengthDisplay } from '../../shared/medication.ts'

const MedicationsTableColumns: TableColumn<PrescriptionMedication>[] = [
  {
    label: 'Condition',
    data: 'condition_name',
  },
  {
    label: 'Medication',
    data: 'drug_generic_name',
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
    data: (m) => strengthDisplay(m),
  },
  {
    label: 'Schedules',
    data: (medication) => (
      <ul>
        {medication.schedules.map((schedule) => (
          <li>{scheduleDisplay(schedule, medication)}</li>
        ))}
      </ul>
    ),
  },
  {
    label: 'Special Instructions',
    data: 'special_instructions',
  },
]

export function MedicationsTable(
  { medications }: { medications: PrescriptionMedication[] },
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
