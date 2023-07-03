import Table, { TableColumn } from '../library/Table.tsx'

type Patient = {
  id: number
  name: string
  avatar_url?: string
  last_visited?: string
  nearest_facility?: string
}

const columns: TableColumn<Patient>[] = [
  {
    label: null,
    dataKey: 'avatar_url',
    type: 'avatar',
  },
  {
    label: 'Patient',
    dataKey: 'name',
    type: 'content',
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'ID',
    dataKey: 'id',
    type: 'content',
  },
  {
    label: 'Last Visit',
    dataKey: 'last_visited',
    type: 'content',
  },
  {
    label: 'Nearest Facility',
    dataKey: 'nearest_facility',
    type: 'content',
  },
  {
    label: 'Actions',
    type: 'actions',
    actions: {
      View(patient) {
        return `/app/patients/${patient.id}`
      },
    },
  },
]

export default function PatientsTable({ patients }: { patients: Patient[] }) {
  return (
    <Table
      columns={columns}
      rows={patients}
    />
  )
}
