import { ComponentChildren, JSX } from 'preact'
import cls from '../../util/cls.ts'
import { ExtendedActionData, Maybe } from '../../types.ts'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertPersonLike, Person, PersonData } from './Person.tsx'
import Pagination from './Pagination.tsx'
import entries from '../../util/entries.ts'
import { ActionButton } from './ActionButton.tsx'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { isDateLike } from '../../util/date.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'

type Showable =
  | string[]
  | string
  | number
  | null
  | undefined
  | ComponentChildren

function assertShowable(value: unknown): asserts value is Showable {
  if (value == null) return
  if (typeof value === 'string') return
  if (typeof value === 'number') return
  if (Array.isArray(value) && value.every(isString)) return
  if (typeof value === 'boolean') return
  if (isObjectLike(value) && 'type' in value) return // VNode/JSX element
  throw new Error(
    `Expected a showable value, got ${typeof value}: ${JSON.stringify(value)}`,
  )
}

type Row = Record<string, unknown> & {
  id?: string
}

type RowCallback<T extends Row, V> = (row: T, index: number, rows: T[]) => V

export type TableColumn<T extends Row> =
  & {
    label?: Maybe<string>
    cellClassName?: string
    tdClassName?: string | ((row: T) => string)
    headerClassName?: string
    no_wrapper?: boolean
    data?: unknown
    fallback?: string | null
  }
  & (
    | { type?: 'content'; data: keyof T | RowCallback<T, Showable> }
    | { type: 'date'; data: keyof T | RowCallback<T, Maybe<string | Date>> }
    | {
      type: 'person'
      data: keyof T | RowCallback<T, Maybe<PersonData> | PersonData[]>
    }
    | (T extends { actions: Record<string, null | ExtendedActionData> } ? {
        label: 'Actions'
        type: 'actions'
      }
      : {
        label: 'Actions'
        type: 'actions'
        data?: (row: T) => ExtendedActionData | ExtendedActionData[] | null
      })
  )

type ColumnWithContents<T extends Row> = TableColumn<T> & {
  cell_contents: unknown[]
}

type TableProps<T extends Row> = {
  columns: TableColumn<T>[]
  rows: T[]
  className?: string
  tableClassName?: string
  pagination?: {
    page: number
    has_next_page: boolean
  }
  EmptyState(): JSX.Element
}

function TableCellX<T extends Row>({ column, children }: { column: ColumnWithContents<T>; children: ComponentChildren }) {
  if (column.no_wrapper) return children
  if (children == null || children === false) return children
  return (
    <div
      className={cls(
        'text-gray-900 text-sm',
        column.cellClassName,
      )}
    >
      {children}
    </div>
  )
}

function TableCellContent<T extends Row>({ column, value }: { column: ColumnWithContents<T>; value: unknown }) {
  assert(!isDateLike(value), 'Use the "date" column type for dates')
  assertShowable(value)
  return <TableCellX column={column}>{value}</TableCellX>
}
function TableCellDate<T extends Row>({ column, value }: { column: ColumnWithContents<T> & { type: 'date' }; value: unknown }) {
  if (!value) return null
  assert(isDateLike(value))
  return (
    <TableCellX column={column}>
      <LocalTime timestamp={value} expected_time_range='any' />
    </TableCellX>
  )
}

function TableCellPerson<T extends Row>({ value }: { value: unknown }) {
  if (!value) return null
  const people = [value].flat() as unknown as PersonData[]
  if (arrayIsEmpty(people)) return null
  people.forEach(assertPersonLike)
  return (
    <div className='flex flex-col gap-1'>
      {people.map((person) => <Person key={person.id || person.name} person={person} />)}
    </div>
  )
}
function TableCellActions<T extends Row>({ column, row }: { column: ColumnWithContents<T> & { type: 'actions' }; row: T }) {
  let action_data

  if (
    'data' in column &&
    typeof column.data === 'function'
  ) {
    action_data = column.data(row)
  } else if (
    'actions' in row && row.actions != null
  ) {
    action_data = row.actions
  }
  if (!action_data) {
    return null
  }

  let actions: ExtendedActionData[]
  if (Array.isArray(action_data)) {
    actions = action_data
  } else {
    assert(isObjectLike(action_data))
    actions = []
    for (const [text, action] of entries(action_data)) {
      if (action == null) continue
      if (typeof action === 'string') {
        actions.push({
          text,
          href: action,
        })
      } else {
        assert(isObjectLike(action))
        actions.push(action as ExtendedActionData)
      }
    }
  }

  if (!actions.length) {
    return null
  }

  return (
    <div className='flex flex-col gap-1'>
      {actions.map((action) => (
        <ActionButton
          key={action.text}
          action={action}
        />
      ))}
    </div>
  )
}

function TableCellInnerContents<T extends Row>(
  { row, row_index, column }: {
    row: T
    row_index: number
    column: ColumnWithContents<T>
  },
) {
  const value = column.cell_contents[row_index]
  if ('fallback' in column && column.fallback && column.fallback === value) {
    return <TableCellX column={column}>{column.fallback}</TableCellX>
  }

  switch (column.type) {
    case 'date':
      return <TableCellDate column={column} value={value} />
    case 'actions':
      return <TableCellActions column={column} row={row} />
    case 'person':
      return <TableCellPerson value={value} />
    case 'content':
    case undefined:
      return <TableCellContent column={column} value={value} />
    default:
      return assertUnreachable(column)
  }
}

function TableCell<T extends Row>(
  { row, row_index, column }: {
    row: T
    column: ColumnWithContents<T>
    col_index: number
    row_index: number
  },
) {
  const tdClassName = typeof column.tdClassName === 'function' ? column.tdClassName(row) : column.tdClassName
  return (
    <td
      className={cls(tdClassName, column.label ? 'p-3' : 'p-2')}
      key={column.label}
    >
      <TableCellInnerContents
        row={row}
        row_index={row_index}
        column={column}
      />
    </td>
  )
}

function TableRow<T extends Row>(
  { row, row_index, columns }: {
    row: T
    row_index: number
    columns: ColumnWithContents<T>[]
  },
) {
  return (
    <tr>
      {columns.map((column, col_index) => (
        <TableCell
          column={column}
          row={row}
          row_index={row_index}
          col_index={col_index}
        />
      ))}
    </tr>
  )
}

function TableHeader<T extends Row>(
  { columns }: { columns: ColumnWithContents<T>[] },
) {
  return (
    <thead className='bg-indigo-50'>
      <tr>
        {columns.map((column) => (
          <th
            scope='col'
            className={cls(
              column.headerClassName,
              'text-left text-sm font-semibold text-indigo-900',
              {
                'p-3': !!column.label,
              },
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function* columnsWithSomeNonNullValue<T extends Row>(
  { columns, rows }: Pick<TableProps<T>, 'columns' | 'rows'>,
): Generator<ColumnWithContents<T>> {
  for (const column of columns) {
    // Kinda ugly, but we determine the actions to show within TableCellInnerContents
    // and thus don't need to compute the cell_contents here
    if (column.type === 'actions') {
      const actions_are_computed = typeof column.data === 'function'
      const some_row_has_actions = rows.some((row) => row.actions)
      if (actions_are_computed || some_row_has_actions) {
        yield { ...column, cell_contents: [] }
      }
      continue
    }

    let use_column = false

    const cell_contents = rows.map((row, index) => {
      const value = typeof column.data === 'function' ? column.data(row, index, rows) : row[column.data]

      if (value != null && value !== false && (!Array.isArray(value) || value.length)) {
        use_column = true
      } else if ('fallback' in column && column.fallback) {
        use_column = true
        return column.fallback
      }

      const display = Array.isArray(value) && value.every(isString)
        ? value.join(', ')
        // deno-lint-ignore no-explicit-any
        : (value as any)

      return display
    })

    if (use_column) {
      yield { ...column, cell_contents }
    }
  }
}

export default function Table<T extends Row>(
  { columns, rows, className, EmptyState, pagination, tableClassName }: TableProps<T>,
): JSX.Element {
  if (rows.length === 0) {
    return <EmptyState />
  }

  const columns_with_contents = [...columnsWithSomeNonNullValue({ columns, rows })]
  console.log(columns_with_contents.find((c) => c.label === 'Employees'))

  const table = (
    <div
      className={cls(
        className,
        'overflow-x-auto w-full',
      )}
    >
      <div className='inline-block min-w-full pt-2 align-middle'>
        <table
          className={cls(
            'min-w-full divide-y divide-gray-300 overflow-hidden shadow outline-1 -outline-offset-1 outline-gray-200 sm:rounded-lg',
            tableClassName,
          )}
        >
          <TableHeader columns={columns_with_contents} />
          <tbody className='divide-y divide-gray-200 bg-white'>
            {rows.map((row, row_index) => (
              <TableRow
                key={row.id}
                row={row}
                row_index={row_index}
                columns={columns_with_contents}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (!pagination) return table

  return (
    <>
      {table}
      <Pagination
        page={pagination.page}
        has_next_page={pagination.has_next_page}
      />
    </>
  )
}
