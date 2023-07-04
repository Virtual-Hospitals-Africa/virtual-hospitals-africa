import { FunctionComponent } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/form/Row.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'

interface EmployeeTable {
  isAdmin: boolean
  employees: Employee[]
  facilityId: number
}

export type Employee = {
  id: number
  name: string
  profession: string
  avatar_url?: string
}

const EmployeesTable: FunctionComponent<EmployeeTable> = ({
  isAdmin,
  employees,
  facilityId,
}) => {
  const columns: TableColumn<Employee>[] = [
    {
      label: null,
      dataKey: 'avatar_url',
      type: 'avatar',
    },
    {
      label: 'ID',
      dataKey: 'id',
      type: 'content',
    },
    {
      label: 'Health Worker',
      dataKey: 'name',
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
      <FormRow className='mb-4'>
        <SearchInput />
        {isAdmin &&
          (
            <Button
              type='button'
              href={'/app/facilities/' + facilityId + '/employees/invite'}
              className='block w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
            >
              Invite
            </Button>
          )}
      </FormRow>
      <Table
        columns={isAdmin ? columns : columns.slice(0, 3)}
        rows={employees}
      />
    </>
  )
}

export default EmployeesTable
