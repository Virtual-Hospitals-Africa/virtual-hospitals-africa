import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatient,
} from '../../../../types.ts'
import { getAllWithNames } from '../../../../db/models/patients.ts'
import * as waiting_room from '../../../../db/models/waiting_room.ts'
import { json } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import sortBy from '../../../../util/sortBy.ts'

type PatientsProps = {
  healthWorker: EmployedHealthWorker
  patients: RenderedPatient[]
}

export const handler: LoggedInHealthWorkerHandlerWithProps<PatientsProps> = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    const { organization_id } = ctx.params
    const getting_room = waiting_room.get(ctx.state.trx, { organization_id, health_worker: ctx.state.healthWorker })
    const patients = await getAllWithNames(ctx.state.trx, search)
    const room = await getting_room

    const patients_with_href = patients.map((patient) => {
      const in_waiting_room = room.some((entry) =>
        entry.patient.id === patient.id
      )

      const href = in_waiting_room
        ? `/app/patients/${patient.id}`
        : `/app/organizations/${organization_id}/waiting_room/add?patient_id=${patient?.id}`

      return { id: patient.id, name: patient.name, href, in_waiting_room }
    })

    return json(sortBy(patients_with_href, 'in_waiting_room').reverse())
  },
}
