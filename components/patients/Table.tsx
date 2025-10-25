import { RenderedPatientCompletedPersonal } from '../../types.ts'
import { Person } from '../library/Person.tsx'
import Table, { TableColumn } from '../library/Table.tsx'
import PatientsEmptyState from './EmptyState.tsx'

const columns: TableColumn<RenderedPatientCompletedPersonal>[] = [
  {
    label: 'Patient',
    data(row) {
      return <Person person={row} />
    },
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Last Visit',
    data: 'last_visited',
  },
  {
    label: 'Nearest Organization',
    data: 'nearest_organization',
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]

export default function PatientsTable(
  { patients }: { patients: RenderedPatientCompletedPersonal[] },
) {
  return (
    <Table
      columns={columns}
      rows={patients}
      className='hidden sm:block'
      EmptyState={PatientsEmptyState}
    />
  )
}
