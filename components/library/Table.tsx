import { JSX } from 'preact'
import cls from '../../util/cls.ts'
import Avatar from './Avatar.tsx'

type Row = Record<string, string | number> & { id?: number }

export type TableColumn<T extends Row> =
  & {
    label: null | string
    cellClassName?: string
  }
  & (
    | { type: 'content'; dataKey: keyof T }
    | { type: 'avatar'; dataKey: keyof T }
    | {
      type: 'actions'
      actions: Record<string, (row: T) => string | (() => void)>
    }
  )

type TableProps<T extends Row> = {
  columns: TableColumn<T>[]
  rows: T[]
  className?: string
}

function ActionButton(
  { name, action }: { name: string; action: string | (() => void) },
) {
  return (
    <a
      href={typeof action === 'string' ? action : undefined}
      onClick={typeof action === 'string' ? undefined : action}
      className='text-indigo-600 hover:text-indigo-900'
    >
      {name}
    </a>
  )
}

function TableCellInnerContents<T extends Row>(
  { row, column }: { row: T; column: TableColumn<T> },
) {
  if (column.type === 'content') {
    return (
      <div
        className={cls(
          'text-gray-900 text-sm whitespace-nowrap',
          column.cellClassName,
        )}
      >
        {row[column.dataKey]}
      </div>
    )
  }

  if (column.type === 'avatar') {
    const src = row[column.dataKey]
    if (!src) return <></>
    if (typeof src === 'string') {
      return (
        <div className='flex items-center'>
          <div className='h-11 w-11 flex-shrink-0'>
            <Avatar
              className='h-11 w-11 flex-shrink-0 object-cover'
              src={src}
            />
          </div>
        </div>
      )
    }
    throw new Error(`Expected ${column.dataKey as string} to be of type string`)
  }

  if (column.type === 'actions') {
    const actions = Object.entries(column.actions).map(([name, action]) => ({
      name,
      action: action(row),
    }))
    return (
      <>
        {actions.map((action) => <ActionButton {...action} />)}
      </>
    )
  }

  throw new Error(`Unexpected column.type ${JSON.stringify(column)}`)
}

function TableCell<T extends Row>(
  { row, column }: {
    row: T
    column: TableColumn<T>
    colIndex: number
  },
) {
  return (
    <td
      className={cls(column.label ? 'p-3' : 'p-2')}
      key={column.label}
    >
      <TableCellInnerContents row={row} column={column} />
    </td>
  )
}

function TableRow<T extends Row>(
  { row, columns }: { row: T; columns: TableColumn<T>[] },
) {
  return (
    <tr>
      {columns.map((column, index) => (
        <TableCell column={column} row={row} colIndex={index} />
      ))}
    </tr>
  )
}

function TableHeader<T extends Row>(
  { columns }: { columns: TableColumn<T>[] },
) {
  return (
    <thead className='bg-gray-50'>
      <tr>
        {columns.map((column, _index) => (
          <th
            scope='col'
            className={cls(
              'text-left text-sm font-semibold text-gray-500',
              column.label && 'p-3',
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default function Table<T extends Row>(
  { columns, rows, className }: TableProps<T>,
): JSX.Element {
  return (
    <div
      className={cls(
        className,
        '-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8',
      )}
    >
      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
        <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
          <table className='min-w-full divide-y divide-gray-300'>
            <TableHeader columns={columns} />
            <tbody className='divide-y divide-gray-200 bg-white'>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
