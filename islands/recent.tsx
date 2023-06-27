export type PersonType = {
  id: string
  name: string
  age: number
  lastVisit: string
  avh: string
  image: string
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

function TableRow({ person }: { person: PersonType }) {
  return (
    <tr key={person.id}>
      <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
        <div className="flex items-center">
          <div className="h-11 w-11 flex-shrink-0">
            <img className="h-11 w-11 rounded-full" src={person.image} alt="" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{person.name}</div>
            <div className="mt-1 text-gray-500">{person.age} years old</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.id}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.lastVisit}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.avh}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <a href="#" className="text-indigo-600 hover:text-indigo-900">
          View<span className="sr-only">, {person.name}</span>
        </a>
      </td>
    </tr>
  )
}

function TableHeader({ titles }: { titles: string[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {
          titles.map((title, index) => (
            <th 
              scope="col" 
              className={`text-left text-sm font-semibold text-gray-500 py-3.5 pr-3 ${index === 0 ? 'pl-4' : 'pl-3'}`}
            >
              {title}
            </th>
          ))
        }
      </tr>
    </thead>
  )
}

const tableTitles = [
  'PATIENT NAME',
  'PATIENT ID',
  'LAST VISIT',
  'AVH',
  ''
]

export default function Recent() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHeader titles={tableTitles} />
                <tbody className="divide-y divide-gray-200 bg-white">
                  {PEOPLE.map((person) => <TableRow person={person} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}