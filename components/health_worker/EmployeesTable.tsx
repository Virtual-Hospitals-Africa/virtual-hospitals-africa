import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/form/Row.tsx'
import { SearchInput } from '../library/form/Inputs.tsx'

type EmployeesTableProps = {
  isAdmin: boolean
  employees: Employee[]
  pathname: string
  invitees: Invitee[]
}

export type Employee = {
  name: string
  profession: string
  avatar_url?: string
}

export type Invitee = {
  email: string
  profession: string
}

export function concatEmployeeProfessions(employees: Employee[]): Array<Employee> {

  const inviteeMap = new Map<string, string[]>()
  const returnEmployees: Employee[] = new Array<Employee>()

  employees.forEach((employee) => {
    if (inviteeMap.has(employee.name)) {
      const professions = inviteeMap.get(employee.name)!
      inviteeMap.set(employee.name, professions.concat(employee.profession))
    } else {
      inviteeMap.set(employee.name, [employee.profession])
    }
  });

  employees.forEach((employee) => {
    if (inviteeMap.has(employee.name)) {
        console.log("Found " + employee.name)
      returnEmployees.push({
        name: employee.name,
        profession: inviteeMap.get(employee.name)!.sort().join(', ')!,
        avatar_url: employee.avatar_url,
      })
      inviteeMap.delete(employee.name)
    }
  });

  return returnEmployees;
}

export function transformInviteesToEmployees(invitees: Invitee[]): Employee[] {
  return invitees.map((invitee) => ({
    name: invitee.email,
    profession: invitee.profession,
  }))
}

export default function EmployeesTable({
  isAdmin,
  employees,
  pathname,
  invitees,
}: EmployeesTableProps): JSX.Element {
  let employeesToDisplay = concatEmployeeProfessions(employees)

  if (isAdmin) {
    employeesToDisplay = employeesToDisplay.concat(
      transformInviteesToEmployees(invitees),
    )
  }
  const columns: TableColumn<Employee>[] = [
    {
      label: null,
      dataKey: 'avatar_url',
      type: 'avatar',
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
        rows={employeesToDisplay}
      />
    </>
  )
}
