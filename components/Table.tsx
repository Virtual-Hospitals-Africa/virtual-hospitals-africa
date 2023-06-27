import { FunctionComponent, h } from 'preact'

type TableHeader<T> = {
  label: string;
  dataKey: keyof T;
}

type TableData = string | number | {
  content: string | number;
  image?: string;
  title?: string | number;
}

type TableRow<T> = {
  [K in keyof T]: TableData
}

type TableProp<T> = {
  headers: TableHeader<T>[];
  data: TableRow<T>[];
}

function getTableDataContent(data: TableData) {
  if (typeof data === 'string' || typeof data === 'number') {
    return data
  }
  return data.content
}

function getTableDataTitle(data: TableData) {
  if (typeof data === 'string' || typeof data === 'number') {
    return <></>
  }
  return (
    <div className="mb-1 font-medium text-gray-900">{data.title}</div>
  )
}

function getTableDataImage(data: TableData) {
  if (typeof data === 'string' || typeof data === 'number') {
    return <></>
  }
  return (
    <div className="h-11 w-11 flex-shrink-0">
      <img className="h-11 w-11 rounded-full" src={data.image} alt="" />
    </div>
  )
}

function TableRow<T>({ rowData, headers }: { rowData: TableRow<T>, headers: TableHeader<T>[] }) {

  return (
    <tr>
      {
        headers.map((header, index) => {
          <td
            className={`whitespace-nowrap py-4 pr-3 text-sm text-gray-500 ${index === 0 ? 'pl-4 py-3.5' : 'pl-3 py-4'}`}
            key={header.dataKey}
          >
            <div className="flex items-center gap-4">
              {getTableDataImage(rowData[header.dataKey])}
              <div>
                {getTableDataTitle(rowData[header.dataKey])}
                <div className="text-gray-500">{getTableDataContent(rowData[header.dataKey])}</div>
              </div>
            </div>
          </td>
        })
      }
{/*       
      
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <a href="#" className="text-indigo-600 hover:text-indigo-900">
          View<span className="sr-only">, {rowData.name}</span>
        </a>
      </td> */}
    </tr>
  )
}

function TableHeader<T>({ headers }: { headers: TableHeader<T>[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {
          headers.map((header, index) => (
            <th 
              scope="col" 
              className={`text-left text-sm font-semibold text-gray-500 py-3.5 pr-3 ${index === 0 ? 'pl-4' : 'pl-3'}`}
            >
              {header}
            </th>
          ))
        }
      </tr>
    </thead>
  )
}

function hasIdProperty(obj: any): obj is { id: TableData } {
  return obj && obj.id !== undefined
}

function getRowKey<T>(rowData: TableRow<T>, index: number) {
  if (!hasIdProperty(rowData)) return index.toString()
  const idColumn = rowData['id'];
  if (typeof idColumn === 'string' || typeof idColumn === 'number') {
    return String(idColumn)
  } else if (idColumn && (typeof idColumn.content === 'string' || typeof idColumn.content === 'number')) {
    return String(idColumn.content)
  } else {
    return index.toString()
  }
}

const Table: <T>(props: TableProp<T>) => h.JSX.Element = ({ headers, data }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <TableHeader headers={headers} />
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((rowData, index) => (
                    <TableRow 
                      key={getRowKey(rowData, index)} 
                      rowData={rowData}
                      headers={headers}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Table;