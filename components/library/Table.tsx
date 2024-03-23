import { ComponentChildren, JSX } from 'preact'
import cls from '../../util/cls.ts'
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
    headerClassName?: string
    data?: unknown
  }
  & (
    | { type?: 'content'; data: keyof T | ((row: T) => Showable) }
    | (T extends { actions: Record<string, string | null> } ? {
        label: 'Actions'
        type: 'actions'
      }
      : never)
  )

type MappedColumn<T extends Row> = {
  column: TableColumn<T>
  cell_contents: JSX.Element[]
}

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
  { row, row_index, mapped_column }: {
    row: T
    row_index: number
    mapped_column: MappedColumn<T>
  },
) {
  if (
    mapped_column.column.type === 'content' ||
    mapped_column.column.type === undefined
  ) {
    return (
      <div
        className={cls(
          'text-gray-900 text-sm whitespace-nowrap',
          mapped_column.column.cellClassName,
        )}
      >
        {mapped_column.cell_contents[row_index]}
      </div>
    )
  }

  if (mapped_column.column.type === 'actions') {
    assert('actions' in row)
    assert(isObjectLike(row.actions))
    return (
      <div className='flex flex-col gap-1'>
        {Object.entries(row.actions).map((
          [name, action],
        ) => (
          assert(action == null || typeof action === 'string'),
            <ActionButton name={name} action={action} />
        ))}
      </div>
    )
  }

  throw new Error('Unreachable ' + mapped_column.column.type)
}

function TableCell<T extends Row>(
  { row, row_index, mapped_column }: {
    row: T
    mapped_column: MappedColumn<T>
    col_index: number
    row_index: number
  },
) {
  return (
    <td
      className={cls(mapped_column.column.label ? 'p-3' : 'p-2')}
      key={mapped_column.column.label}
    >
      <TableCellInnerContents
        row={row}
        row_index={row_index}
        mapped_column={mapped_column}
      />
    </td>
  )
}

function TableRow<T extends Row>(
  { row, row_index, mapped_columns }: {
    row: T
    row_index: number
    mapped_columns: MappedColumn<T>[]
  },
) {
  return (
    <tr>
      {mapped_columns.map((mapped_column, col_index) => (
        <TableCell
          mapped_column={mapped_column}
          row={row}
          row_index={row_index}
          col_index={col_index}
        />
      ))}
    </tr>
  )
}

function TableHeader<T extends Row>(
  { mapped_columns }: { mapped_columns: MappedColumn<T>[] },
) {
  return (
    <thead className='bg-gray-50'>
      <tr>
        {mapped_columns.map(({ column }) => (
          <th
            scope='col'
            className={cls(
              'text-left text-sm font-semibold text-gray-500',
              column.label && 'p-3',
              column.headerClassName,
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

//
function* columnsWithSomeNonNullValue<T extends Row>(
  { columns, rows }: TableProps<T>,
) {
  for (const column of columns) {
    // Kinda ugly, but we determine the actions to show within TableCellInnerContents
    // and thus don't need to compute the cell_contents here
    if (column.type === 'actions') {
      yield { column, cell_contents: [] }
      continue
    }

    let use_column = false
    const cell_contents = rows.map((row) => {
      const value = typeof column.data === 'function'
        ? column.data(row)
        : row[column.data]

      if (value != null && (!Array.isArray(value) || value.length)) {
        use_column = true
      }

      const display = Array.isArray(value) && value.every(isString)
        ? value.join(', ')
        // deno-lint-ignore no-explicit-any
        : (value as any)

      return display
    })

    if (use_column) {
      yield { column, cell_contents }
    }
  }
}

export default function Table<T extends Row>(
  { columns, rows, className }: TableProps<T>,
): JSX.Element {
  const mapped_columns = [...columnsWithSomeNonNullValue({ columns, rows })]

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
            <TableHeader mapped_columns={mapped_columns} />
            <tbody className='divide-y divide-gray-200 bg-white'>
              {rows.map((row, row_index) => (
                <TableRow
                  key={row.id}
                  row={row}
                  row_index={row_index}
                  mapped_columns={mapped_columns}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
