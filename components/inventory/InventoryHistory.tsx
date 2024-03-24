import { RenderedInventoryHistory } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedInventoryHistory>[] = [
  {
    label: 'Log',
    data(row) {
      return row.change ? 'Procurement' : 'Consumption'
    },
  },
  {
    label: 'Change',
    data(row) {
      const is_positive = row.change > 0
      return (
        <span class={is_positive ? 'text-green-400' : 'text-yellow-400'}>
          {!!is_positive && '+'}
          {row.change}
        </span>
      )
    },
  },
  {
    label: 'Employee',
    type: 'person',
    data: 'created_by',
  },
  {
    label: 'Procurer',
    data: 'procured_by',
  },
  {
    label: 'Expires',
    data: 'expiry_date',
  },
  {
    label: 'Date',
    data: 'created_at_formatted',
  },
]

export default function InventoryHistoryTable(
  { history }: {
    history: RenderedInventoryHistory[]
  },
) {
  return (
    <Table
      columns={columns}
      rows={history}
      EmptyState={() => {
        throw new Error(
          'Should not have access to a history page for which there are no entries',
        )
      }}
    />
  )
}
