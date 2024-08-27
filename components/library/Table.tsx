import { ComponentChildren, JSX } from 'preact'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertPersonLike, Person, PersonData } from './Person.tsx'

type Showable =
  | string
  | number
  | string[]
  | null
  | undefined
  | ComponentChildren

type Row = Record<string, unknown> & {
  id?: string
}

type ExtendedActionData = string | {
  text: string;
  href?: string;
  disabled?: boolean;
};

export type TableColumn<T extends Row> =
  & {
    label?: Maybe<string>
    cellClassName?: string
    headerClassName?: string
    data?: unknown
  }
  & (
    | { type?: 'content'; data: keyof T | ((row: T) => Showable) }
    | {
      type: 'person'
      data: keyof T | ((row: T) => Maybe<PersonData> | PersonData[])
    }
    | (T extends { actions: Record<string, string | null> } ? {
        label: 'Actions'
        type: 'actions'
      }
      : { 
        label: 'Actions'
        type: 'actions'
        data: (row: T) => ExtendedActionData | ExtendedActionData[] 
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
  EmptyState(): JSX.Element
}

function ActionButton(
  { name, action }: { name: string; action?: Maybe<ExtendedActionData> }
) {
  if (!action) return null;
  
  if (typeof action === 'string') {
    return (
      <a 
        href={action} 
        className='text-indigo-600 hover:text-indigo-900 capitalize'
      >
        {name}
      </a>
    );
  }

  return action.disabled ? (
    <span 
      className='text-gray-400 capitalize'
    >
      {action.text || name}
    </span>
  ) : (
    <a 
      href={action.href} 
      className='text-indigo-600 hover:text-indigo-900 capitalize'
    >
      {action.text || name}
    </a>
  );
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

  if (mapped_column.column.type === 'person') {
    const person = mapped_column.cell_contents[row_index]
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
    let actionContent;
    
    if ('data' in mapped_column.column && typeof mapped_column.column.data === 'function') {
      const actionData = mapped_column.column.data(row);
      const actions = Array.isArray(actionData) ? actionData : [actionData];
      actionContent = (
        <div className='flex flex-col gap-1'>
          {actions.map((action, index) => (
            <ActionButton 
              key={index} 
              name={typeof action === 'string' ? action : action.text} 
              action={action} 
            />
          ))}
        </div>
      );
    } else if ('actions' in row && row.actions != null) {
      assert(isObjectLike(row.actions))
      actionContent = (
        <div className='flex flex-col gap-1'>
          {Object.entries(row.actions).map(([name, action]) => (
            <ActionButton key={name} name={name} action={action as Maybe<ExtendedActionData>} />
          ))}
        </div>
      );
    }

    return actionContent || null;
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
      if (rows.some((row) => row.actions)) {
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
  { columns, rows, className, EmptyState }: TableProps<T>,
): JSX.Element {
  if (rows.length === 0) {
    return <EmptyState />
  }

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
