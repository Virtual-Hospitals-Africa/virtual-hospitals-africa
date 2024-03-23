import { RenderedInventoryHistory } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'

const columns: TableColumn<RenderedInventoryHistory>[] = [
  {
    label: 'Log',
    data(row) {
      return row.change ? 'Procurement' : 'Consumption'
    },
  },
  {
    label: 'Procurer',
    data: 'procured_by',
  },
  {
    label: 'Employee',
    type: 'person',
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
