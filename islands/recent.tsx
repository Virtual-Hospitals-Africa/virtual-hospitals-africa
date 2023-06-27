import Table, { TableData, TableHeader } from '../components/Table.tsx'

export type PersonType = {
  id: string
  name: string
  age: number
  lastVisit: string
  avh: string
  image: string
}

type TableRow = {
  id: TableData
  name: TableData
  lastVisit: TableData
  avh: TableData
  view: TableData
}

const PEOPLE: PersonType[] = [
  {
    id: 'PAT456789D',
    name: 'Lindsay Walton',
    age: 46,
    lastVisit: '4/19/2023',
    avh: 'Hope Clinic',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: 'PAT456729D',
    name: 'Lindsay Walton',
    age: 42,
    lastVisit: '4/19/2023',
    avh: 'Hope Clinic',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

const tableTitles: TableHeader<TableRow>[] = [
  {
    label: 'PATIENT NAME',
    dataKey: 'name',
  },
  {
    label: 'PATIENT ID',
    dataKey: 'id',
  },
  {
    label: 'LAST VISIT',
    dataKey: 'lastVisit',
  },
  {
    label: 'AVH',
    dataKey: 'avh',
  },
  {
    label: '',
    dataKey: 'view',
  },
]

function formatTableData(data: PersonType[]): TableRow[] {
  return data.map((person) => ({
    id: person.id,
    name: {
      title: person.name,
      image: person.image,
      content: `${person.age} years old`,
    },
    lastVisit: person.lastVisit,
    avh: person.avh,
    view: {
      content: 'View',
      action: `/app/patient/${person.id}`,
    },
  }))
}

export default function Recent() {
  return <Table headers={tableTitles} data={formatTableData(PEOPLE)} />
}
