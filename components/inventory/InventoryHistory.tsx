import { RenderedInventoryHistory } from '../../types.ts'
import Table, { TableColumn } from '../library/Table.tsx'
import capitalize from '../../util/capitalize.ts'
import { RenderedInventoryHistoryPrescriptionFilled } from '../../types.ts'

const columns: TableColumn<RenderedInventoryHistory>[] = [
  {
    label: 'Log',
    data(row) {
      return capitalize(row.interaction)
    },
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
          {!!is_positive && '+'}
          {row.change}
        </span>
      )
    },
  },
  {
    label: 'Patient',
    type: 'person',
    data: 'patient',
  },

  {
    label: 'Procurer',
    data(row) {
      return row.procured_from?.name
    },
  },
  {
    label: 'Date',
    data: 'created_at_formatted',
  },
  {
    label: 'Batch Number',
    data: 'batch_number',
  },
  {
    label: 'Expires',
    data: 'expiry_date',
  },
  {
    type: 'actions',
    label: 'Actions',
  },
]

const fake_prescriptions: RenderedInventoryHistoryPrescriptionFilled[] = [
  {
    interaction: 'prescription filled',
    created_at: new Date(),
    created_at_formatted: '4 April 2024 10:51:44 AM',
    created_by: {
      name: 'Susan Mlalazi',
      avatar_url: '/images/avatars/random/female/2.png',
      href: '/foo',
    },
    procured_from: null,
    change: -20,
    expiry_date: null,
    batch_number: '622',
    patient: {
      name: 'Bongani Nyathi',
      description: 'female, 20 years',
      avatar_url: '/images/avatars/random/female/3.png',
      href: '/foo',
    },
    actions: {
      view: '/app/prescriptions/1',
    },
  },
  {
    interaction: 'prescription filled',
    created_at: new Date(),
    created_at_formatted: '5 April 2024 9:50:09 AM',
    created_by: {
      name: 'Susan Mlalazi',
      avatar_url: '/images/avatars/random/female/2.png',
      href: '/foo',
    },
    procured_from: null,
    change: -10,
    expiry_date: null,
    batch_number: '622',
    patient: {
      name: 'Ernest Mafusire',
      description: 'male, 22 years',
      avatar_url: '/images/avatars/random/male/3.png',
      href: '/foo',
    },
    actions: {
      view: '/app/prescriptions/1',
    },
  },
  {
    interaction: 'prescription filled',
    created_at: new Date(),
    created_at_formatted: '6 April 2024 3:16:22 PM',
    created_by: {
      name: 'Tafara Ndhlovu',
      avatar_url: '/images/avatars/random/male/4.png',
      href: '/foo',
    },
    procured_from: null,
    change: -30,
    expiry_date: null,
    batch_number: '622',
    patient: {
      name: 'Christopher Mukono',
      description: 'male, 32 years',
      avatar_url: '/images/avatars/random/male/7.png',
      href: '/foo',
    },
    actions: {
      view: '/app/prescriptions/1',
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
      rows={history.concat(fake_prescriptions).toReversed()}
      EmptyState={() => {
        throw new Error(
          'Should not have access to a history page for which there are no entries',
        )
      }}
    />
  )
}
