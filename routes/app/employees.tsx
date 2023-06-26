import { PageProps } from '$fresh/server.ts'
import { LoggedInHealthWorkerHandler } from "../../types.ts";
import HealthWorkerTable from '../../components/HealthWorkerTable.tsx'
import isAdmin from '../../util/isAdmin.ts'

const people = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
]

export const handler: LoggedInHealthWorkerHandler<
  { isAdmin: boolean }
> = {
  async GET(req, ctx) {
     const adminState = await isAdmin(ctx.state)
     return ctx.render({ isAdmin: adminState })
  }
}

export default function Table(
  props: PageProps<
  { isAdmin: boolean }
  >,
) {

  console.log(props.data)

  return (
    <HealthWorkerTable
      isAdmin={props.data.isAdmin}
      employees={
        [
          {
            name: "jon doe",
            profession: 'nurse',
            email: "123@gmail.com",
            facility: "clinicA"
          },
          {
            name: "bob smith",
            profession: 'doctor',
            email: "bob@gmail.com",
            facility: "clinicB"
          }
        ]
      }
    />
  )
}