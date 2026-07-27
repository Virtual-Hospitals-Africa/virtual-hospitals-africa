import type { JSX } from 'preact'
import Table, { TableColumn } from '../../library/Table.tsx'
import { EmptyState } from '../../library/EmptyState.tsx'
import { ClipboardDocumentListIcon } from '../../library/icons/heroicons/outline.tsx'

export type OrderRow = {
  id: string
  created_at: Date | string
  specific_snomed_concept_name: string
  root_snomed_concept_name: string
  alphanumeric_code: string | null
}

export default function PatientOrders({ orders }: { orders: OrderRow[] }): JSX.Element {
  const columns: TableColumn<OrderRow>[] = [
    {
      label: 'Date',
      type: 'date',
      data: 'created_at',
    },
    {
      label: 'Order',
      data: 'specific_snomed_concept_name',
    },
    {
      label: 'Category',
      data: 'root_snomed_concept_name',
    },
    {
      label: 'Redemption Code',
      data: 'alphanumeric_code',
    },
  ]

  return (
    <Table
      columns={columns}
      rows={orders}
      EmptyState={() => (
        <EmptyState
          header='No orders'
          explanation='This patient has no recorded orders'
          Icon={ClipboardDocumentListIcon}
        />
      )}
    />
  )
}
