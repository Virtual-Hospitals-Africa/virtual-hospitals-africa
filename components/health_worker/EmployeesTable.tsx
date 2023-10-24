import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/form/Row.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'
import { FacilityEmployee } from '../../db/models/facilities.ts'

type EmployeesTableProps = {
  isAdmin: boolean
  employees: FacilityEmployee[]
  pathname: string
  facility_id: number
  health_worker_id: number
}

type Employee = {
  avatar_url: null | string
  display_name: string
  professions: string[]
  health_worker_id: number | null
  href: string | null
  registration_status: string
}

export default function EmployeesTable({
  isAdmin,
  employees,
  pathname,
}: EmployeesTableProps): JSX.Element {
  const columns: TableColumn<Employee>[] = [
    {
      label: null,
      dataKey: 'avatar_url',
      type: 'avatar',
    },
    {
      label: 'Health Worker',
      dataKey: 'display_name',
      type: 'content',
    },
    {
      label: 'Profession',
      dataKey: 'professions',
      type: 'content',
    },
    {
      label: 'Actions',
      type: 'actions',
      actions: {
        ['View'](row: Employee) {
          if (
            row.href &&
            !(isAdmin && row.registration_status === 'pending_approval')
          ) {
            return row.href
          }
        },
        ['Approve'](row: Employee) {
          if (isAdmin && row.registration_status === 'pending_approval') {
            return row.href
          }
        },
      },
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
              className='block w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
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
