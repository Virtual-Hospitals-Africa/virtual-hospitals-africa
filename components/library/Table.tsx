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
import isDate from '../../util/isDate.ts'
import { LocalTime } from '../../islands/LocalTime.tsx'
import { rfc3339_regex } from '../../util/date.ts'

type Showable =
  | string[]
  | string
  | number
  | null
  | undefined
  | ComponentChildren

type Row = Record<string, unknown> & {
  id?: string
}

export type TableColumn<T extends Row> =
  & {
    label?: Maybe<string>
    cellClassName?: string
    tdClassName?: string | ((row: T) => string)
    headerClassName?: string
    data?: unknown
  }
  & (
    | { type?: 'content'; data: keyof T | ((row: T) => Showable) }
    | { type: 'date'; data: keyof T | ((row: T) => Maybe<string | Date>) }
    | {
      type: 'person'
      data: keyof T | ((row: T) => Maybe<PersonData> | PersonData[])
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

type MappedColumn<T extends Row> = {
  column: TableColumn<T>
  // deno-lint-ignore no-explicit-any
  cell_contents: any[]
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

function TableCellInnerContents<T extends Row>(
  { row, row_index, mapped_column }: {
    row: T
    row_index: number
    mapped_column: MappedColumn<T>
  },
) {
  const value = mapped_column.cell_contents[row_index]
  const is_date = isDate(value) ||
    (isString(value) && rfc3339_regex.test(value))
  if (
    mapped_column.column.type === 'content' ||
    mapped_column.column.type === undefined
  ) {
    assert(!is_date, 'Use the "date" column type for dates')
    return (
      <div
        className={cls(
          'text-gray-600 text-sm whitespace-nowrap',
          mapped_column.column.cellClassName,
        )}
      >
        {value}
      </div>
    )
  }

  if (
    mapped_column.column.type === 'date'
  ) {
    assert(!value || is_date)

    return (
      <div
        className={cls(
          'text-gray-600 text-sm whitespace-nowrap',
          mapped_column.column.cellClassName,
        )}
      >
        <LocalTime timestamp={value} expected_time_range='any' />
      </div>
    )
  }

  if (mapped_column.column.type === 'person') {
    const person = value
    if (person == null || (Array.isArray(person) && person.length === 0)) {
      return null
    }
    const persons = Array.isArray(person) ? person : [person]
    persons.forEach(assertPersonLike)
    return (
      <div className='flex flex-col gap-1'>
        {persons.map((person) => (
          <Person key={person.id || person.name} person={person} />
        ))}
      </div>
    )
  }

  if (mapped_column.column.type === 'actions') {
    let action_data

    if (
      'data' in mapped_column.column &&
      typeof mapped_column.column.data === 'function'
    ) {
      action_data = mapped_column.column.data(row)
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
  const tdClassName = typeof mapped_column.column.tdClassName === 'function'
    ? mapped_column.column.tdClassName(row)
    : mapped_column.column.tdClassName
  return (
    <td
      className={cls(tdClassName, mapped_column.column.label ? 'p-3' : 'p-2')}
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
    <thead className='bg-indigo-50'>
      <tr>
        {mapped_columns.map(({ column }) => (
          <th
            scope='col'
            className={cls(
              'text-left text-sm font-semibold text-indigo-900',
              column.label && 'p-3',
              // Shift the header to the right to make space for the avatar
              column.type === 'person' && 'pl-12',
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

function* columnsWithSomeNonNullValue<T extends Row>(
  { columns, rows }: Pick<TableProps<T>, 'columns' | 'rows'>,
) {
  for (const column of columns) {
    // Kinda ugly, but we determine the actions to show within TableCellInnerContents
    // and thus don't need to compute the cell_contents here
    if (column.type === 'actions') {
      const actions_are_computed = typeof column.data === 'function'
      const some_row_has_actions = rows.some((row) => row.actions)
      if (actions_are_computed || some_row_has_actions) {
        yield { column, cell_contents: [] }
      }
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
  { columns, rows, className, EmptyState, pagination, tableClassName }:
    TableProps<T>,
): JSX.Element {
  if (rows.length === 0) {
    return <EmptyState />
  }

  const mapped_columns = [...columnsWithSomeNonNullValue({ columns, rows })]

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
