import { FunctionComponent } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/form/Row.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'

interface EmployeeTable {
  isAdmin: boolean
  employees: Employee[]
}

export type Employee = {
  id: number
  name: string
  profession: string
  avatar_url?: string
}

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
]

const adminColumns: TableColumn<Employee>[] = [
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
      Resend_Invite() {
        return () => {
          throw new Error('Not implemented yet')
        }
      },
    },
  },
]

const HealthWorkerTable: FunctionComponent<EmployeeTable> = ({
  isAdmin,
  employees,
}) => {
  if (isAdmin) {
    return (
      <>
        <FormRow className='mb-4'>
          <SearchInput />
          <Button
            type='button'
            href='employees/invite'
            className='block w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Invite
          </Button>
        </FormRow>
        <Table
          columns={adminColumns}
          rows={employees}
        />
      </>
    )
  } else {
    return (
      <>
        <FormRow className='mb-4'>
          <SearchInput />
        </FormRow>
        <Table
          columns={columns}
          rows={employees}
        />
      </>
    )
  }
}

export default HealthWorkerTable
