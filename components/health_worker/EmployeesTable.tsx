import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { Person } from '../library/Person.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/FormRow.tsx'

import { RenderedEmployee } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { SearchInput } from '../../islands/form/inputs/search.tsx'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { employeeOrganizationDepartmentNames } from '../../shared/departments.ts'

type EmployeesTableProps = {
  is_admin: boolean
  employees: RenderedEmployee[]
  pathname: string
  organization_id: string
  health_worker_id: string
}

export default function EmployeesTable({
  is_admin,
  employees,
  pathname,
}: EmployeesTableProps): JSX.Element {
  const columns: TableColumn<RenderedEmployee>[] = [
    {
      label: 'Employee',
      headerClassName: 'pl-12',
      data(row) {
        return (
          <Person
            person={{
              ...row,
              display_name: employeeDisplay(row).display_name,
            }}
          />
        )
      },
    },
    {
      label: 'Profession',
      data(row) {
        return employeeDisplay(row).description
      },
    },
    {
      label: 'Departments',
      data: employeeOrganizationDepartmentNames,
    },
    {
      label: 'Actions',
      type: 'actions',
    },
  ]

  const add_href = `${pathname}/invite`

  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        {is_admin &&
          (
            <Button
              type='button'
              href={add_href}
              className='grid self-end p-2 text-white border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center'
            >
              Invite
            </Button>
          )}
      </FormRow>
      <Table
        columns={columns}
        rows={employees}
        EmptyState={() => (
          <EmptyState
            header='No employees'
            explanation='Invite a health worker to get started'
            Icon={UserCircleIcon}
            button={is_admin ? { children: 'Invite', href: add_href } : undefined}
          />
        )}
      />
    </>
  )
}
