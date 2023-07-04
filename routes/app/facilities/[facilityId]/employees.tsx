import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import * as health_workers from '../../../../db/models/health_workers.ts'
import Table, {
  TableColumn,
} from '../../../../components/library/Table.tsx'

export const handler: LoggedInHealthWorkerHandler<
  {
    isAdmin: boolean
    tableData: Employee[]
  }
> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    const facilityId = parseInt(ctx.params.facilityId)
    assert(
      health_workers.isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: facilityId,
      },
    )
    const employeeData = await health_workers.getEmployeesAtFacility(
      ctx.state.trx,
      {
        facilityId: facilityId,
      },
    )
    const tableData: Employee[] = []
    employeeData.map((value) => {
      tableData.push(
        {
          name: value.name,
          profession: value.profession,
          id: value.id,
        },
      )
    })
    return ctx.render({ isAdmin, tableData })
  },
}

type Employee = {
  id: number,
  name: string,
  profession: string
  avatar_url?: string
}

const columns : TableColumn<Employee>[] = [
  {
    label: null,
    dataKey: 'avatar_url',
    type: 'avatar'
  },
  {
    label: "ID",
    dataKey: "id",
    type: 'content'
  },
  {
    label: "Health Worker",
    dataKey: "name",
    type: 'content'
  },
  {
    label: "Profession",
    dataKey: "profession",
    type: 'content'
  }
]

export default function EmployeeTable(
  props: PageProps<
    {
      isAdmin: boolean
      tableData: Employee[]
    }
  >,
) {
  console.log('props.data', props.data)
  if (props.data.isAdmin) {
    columns.push(
      {
        label: "Actions",
        type: 'actions',
        actions: {
          resendInvite(employee: Employee) {
            return "not implemented yet"
          }
        }
      }
    )
  }
  return (
    <Table
      columns={columns}
      rows={props.data.tableData}
    />
  )
}
