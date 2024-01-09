import { ComponentChildren, JSX } from 'preact'
import cls from '../../util/cls.ts'
import Avatar from './Avatar.tsx'
import { Maybe } from '../../types.ts'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'

type Showable =
  | string
  | number
  | string[]
  | null
  | undefined
  | ComponentChildren

type Row = Record<string, unknown> & {
  id?: number
}
export type TableColumn<T extends Row> =
  & {
    label?: Maybe<string>
    cellClassName?: string
    dataKey?: unknown
  }
  & (
    | { type: 'content'; dataKey: keyof T | ((row: T) => Showable) }
    | { type: 'avatar'; dataKey: keyof T | ((row: T) => Showable) }
    | (T extends { actions: Record<string, string | null> } ? {
        label: 'Actions'
        type: 'actions'
      }
      : never)
  )

type TableProps<T extends Row> = {
  columns: TableColumn<T>[]
  rows: T[]
  className?: string
}

function ActionButton(
  { name, action }: { name: string; action?: Maybe<string> },
) {
  return !action ? null : (
    <a
      href={typeof action === 'string' ? action : undefined}
      className='text-indigo-600 hover:text-indigo-900 capitalize'
    >
      {name}
    </a>
  )
}

function TableCellInnerContents<T extends Row>(
  { row, column }: { row: T; column: TableColumn<T> },
) {
  if (column.type === 'content') {
    const value = typeof column.dataKey === 'function'
      ? column.dataKey(row)
      : row[column.dataKey]

    const display = Array.isArray(value) && value.every(isString)
      ? value.join(', ')
      // deno-lint-ignore no-explicit-any
      : (value as any)

    return (
      <div
        className={cls(
          'text-gray-900 text-sm whitespace-nowrap',
          column.cellClassName,
        )}
      >
        {display}
      </div>
    )
  }

  if (column.type === 'avatar') {
    const src = typeof column.dataKey === 'function'
      ? column.dataKey(row)
      : row[column.dataKey]
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
    throw new Error(
      `Expected ${
        column.label || column.dataKey as string
      } to be of type string`,
    )
  }

  if (column.type === 'actions') {
    assert('actions' in row)
    assert(isObjectLike(row.actions))
    return (
      <>
        {Object.entries(row.actions).map((
          [name, action],
        ) => (
          assert(action == null || typeof action === 'string'),
            <ActionButton name={name} action={action} />
        ))}
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
