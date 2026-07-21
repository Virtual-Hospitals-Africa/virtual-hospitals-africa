import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { Person } from '../library/Person.tsx'
import { RenderedPatient } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { UsersIcon } from '../library/icons/heroicons/outline.tsx'
import Badge from '../library/Badge.tsx'

export default function PatientsTable({ patients }: { patients: RenderedPatient[] }): JSX.Element {
  const columns: TableColumn<RenderedPatient>[] = [
    {
      label: 'Patient',
      data(row) {
        const href = row.completed_registration ? `/app/patients/${row.id}` : undefined
        return <Person person={{ ...row, display_name: row.name || 'Unnamed', href }} />
      },
    },
    {
      label: 'Sex',
      data: 'sex',
    },
    {
      label: 'Date of Birth',
      data: 'dob_formatted',
    },
    {
      label: 'National ID',
      data: 'national_id_number',
    },
    {
      label: 'Registration',
      data(row) {
        return row.completed_registration ? <Badge color='green' content='Complete' /> : <Badge color='yellow' content='Incomplete' />
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={patients}
      EmptyState={() => (
        <EmptyState
          header='No patients'
          explanation='No patients match your search'
          Icon={UsersIcon}
        />
      )}
    />
  )
}
