import { RenderedInventoryHistory } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedInventoryHistory>[] = [
  {
    label: 'Date',
    data(row) {
      return (
        <div>
          {row.created_at.toLocaleString()}
        </div>
      )
    },
  },
  {
    label: 'Procurer',
    data: 'procured_by',
  },
  {
    label: 'Employee/Consumer',
    data: 'created_by',
  },
  {
    label: 'Change',
    data(row) {
      const is_positive = row.change > 0
      return (
        <span class={is_positive ? 'text-green-400' : 'text-yellow-400'}>
          {is_positive ? '+' : '-'} {row.change}
        </span>
      )
    },
  },
  {
    label: 'Expires',
    data: 'expiry_date',
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
    />
  )
}
