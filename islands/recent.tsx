import Table, { TableColumn } from '../components/library/Table.tsx'

type Patient = {
  id: number
  name: string
  last_visited: string
  nearest_facility: string
  avatar_url: string
}

const patients: Patient[] = [
  {
    id: 123,
    name: 'Lindsay Walton',
    last_visited: '4/19/2023',
    nearest_facility: 'Hope Clinic',
    avatar_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 456,
    name: 'Jessie Jones',
    last_visited: '4/18/2023',
    nearest_facility: 'Hope Clinic',
    avatar_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

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

export default function RecentPatients() {
  return (
    <Table
      columns={columns}
      rows={patients}
    />
  )
}
