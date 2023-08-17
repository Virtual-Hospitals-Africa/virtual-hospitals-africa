import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'

type InviteesTableProps = {
  invitees: Invitee[]
}

export type Invitee = {
  id: number
  email: string
  profession: string
}

export default function InviteesTable({
  invitees,
}: InviteesTableProps): JSX.Element {
  const columns: TableColumn<Invitee>[] = [
    {
      label: 'inviteeID',
      dataKey: 'id',
      type: 'content',
    },
    {
      label: 'Email',
      dataKey: 'email',
      type: 'content',
    },
    {
      label: 'Profession',
      dataKey: 'profession',
      type: 'content',
    },
    {
      label: 'Actions',
      type: 'actions',
      actions: {
        ['Resend Invite']() {
          return () => {
            throw new Error('Not implemented yet')
          }
        },
      },
    },
  ]

  return (
    <>
      <Table
        columns={columns}
        rows={invitees}
      />
    </>
  )
}
	