import { RenderedPatient } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<
  Pick<
    RenderedPatient,
    'avatar_url' | 'name' | 'last_visited' | 'nearest_facility' | 'href'
  >
>[] = [
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
        return patient.href
      },
    },
  },
]

export default function PatientsTable(
  { patients }: { patients: RenderedPatient[] },
) {
  return (
    <Table
      columns={columns}
      rows={patients}
      className='hidden sm:block'
    />
  )
}
