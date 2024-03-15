import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import { FacilityEmployeeOrInvitee } from '../../types.ts'

type EmployeesTableProps = {
  isAdmin: boolean
  employees: FacilityEmployeeOrInvitee[]
  pathname: string
  facility_id: number
  health_worker_id: number
}

export default function EmployeesTable({
  isAdmin,
  employees,
  pathname,
}: EmployeesTableProps): JSX.Element {
  const columns: TableColumn<FacilityEmployeeOrInvitee>[] = [
    {
      label: null,
      dataKey: 'avatar_url',
      type: 'avatar',
    },
    {
      label: 'Health Worker',
      dataKey: 'display_name',
    },
    {
      label: 'Profession',
      dataKey(row) {
        return row.professions.map(({ profession }) => profession).join(', ')
      },
    },
    {
      label: 'Actions',
      type: 'actions',
    },
  ]

  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        {isAdmin &&
          (
            <Button
              type='button'
              href={`${pathname}/invite`}
              className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
            >
              Invite
            </Button>
          )}
      </FormRow>
      <Table
        columns={columns}
        rows={employees}
      />
    </>
  )
}
