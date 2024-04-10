import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  RenderedPatient,
} from '../../../../types.ts'
import { getAllWithNames } from '../../../../db/models/patients.ts'
import * as waiting_room from '../../../../db/models/waiting_room.ts'
import { json } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'

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
    const facility_id = parseInt(ctx.params.facility_id)
    const getting_room = waiting_room.get(ctx.state.trx, { facility_id })
    const patients = await getAllWithNames(ctx.state.trx, search)
    const room = await getting_room

    const patients_with_href = patients.map((patient) => {
      const patient_in_waiting_room = room.some((entry) =>
        entry.patient.id === patient.id
      )

      const href = patient_in_waiting_room
        ? `/app/patients/${patient.id}`
        : `/app/facilities/${facility_id}/waiting_room/add?patient_id=${patient?.id}`

      return { ...patient, href }
    })

    return json(patients_with_href)
  },
}
