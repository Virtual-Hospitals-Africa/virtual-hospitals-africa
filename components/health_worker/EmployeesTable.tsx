import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/form/Row.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'
import { Profession } from '../../types.ts'
import { FacilityEmployee } from '../../db/models/facilities.ts'

type EmployeesTableProps = {
  isAdmin: boolean
  employees: FacilityEmployee[]
  pathname: string
}

type Employee = {
  avatar_url: null | string
  display_name: string
  professions: Profession[]
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
  ]

  if (isAdmin) {
    columns.push({
      label: 'Actions',
      type: 'actions',
      actions: {
        ['Resend Invite']() {
          return () => {
            throw new Error('Not implemented yet')
          }
        },
      },
    })
  }
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
