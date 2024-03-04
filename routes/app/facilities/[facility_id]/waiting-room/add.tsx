import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as facilities from '../../../../../db/models/facilities.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
} from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import redirect from '../../../../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { assertOr400 } from '../../../../../util/assertOr.ts'
import { hasName } from '../../../../../util/haveNames.ts'
import { EncounterReason } from '../../../../../db.d.ts'
import AddPatientForm from '../../../../../islands/waiting-room/AddPatientForm.tsx'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<never, unknown>,
  {
    facility: { id: number; name: string }
  }
> = {
  async POST(req, ctx) {
    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)
    const to_upsert = await parseRequestAsserts(
      ctx.state.trx,
      req,
      patient_encounters.assertIsUpsert,
    )

    const upserted = await patient_encounters.upsert(
      ctx.state.trx,
      facility_id,
      to_upsert,
    )
    const { intake } = to_upsert

    const next_url = intake
      ? `/app/patients/${upserted.patient_id}/intake/personal`
      : `/app/facilities/${facility_id}/waiting-room?just_encountered_id=${upserted.id}`

    return redirect(next_url)
  },
}

export default async function WaitingRoomAdd(
  _req: Request,
  { url, state, params, route }: FreshContext<LoggedInHealthWorker>,
) {
  const { trx } = state
  const { searchParams } = url
  const patient_id = parseInt(searchParams.get('patient_id')!) || null
  const encounter_id = parseInt(searchParams.get('encounter_id')!) || null
  assertOr400(!patient_id || !encounter_id, 'patient_id or encounter_id only')

  const patient_name = searchParams.get('patient_name')
  const just_completed_intake = url.searchParams.get('intake') === 'completed'

  let completing_intake: Promise<unknown> = Promise.resolve()
  if (just_completed_intake) {
    assertOr400(patient_id, 'patient_id is required')
    completing_intake = patients.upsert(trx, {
      id: patient_id,
      completed_intake: true,
    })
  }

  const facility_id = parseInt(params.facility_id)
  assert(facility_id)

  const gettingProviders = facilities.getApprovedDoctorsAndNurses(trx, {
    facility_id,
  })

  let open_encounter: Maybe<{ encounter_id: number; reason: EncounterReason }>
  let patient: { id?: number; name: string } | undefined
  if (patient_id) {
    const getting_open_encounter = patient_encounters.get(trx, {
      patient_id,
      encounter_id: 'open',
    })
    await completing_intake
    const fetched_patient = await patients.getByID(trx, {
      id: patient_id,
    })

    assert(hasName(fetched_patient))
    patient = fetched_patient
    open_encounter = await getting_open_encounter
  } else if (patient_name) {
    patient = { name: patient_name }
  }

  return (
    <Layout
      title={'Add patient to waiting room'}
      route={route}
      url={url}
      health_worker={state.healthWorker}
      variant='home page'
    >
      <Container size='md'>
        <AddPatientForm
          providers={await gettingProviders}
          open_encounter={open_encounter}
          patient={patient}
        />
      </Container>
    </Layout>
  )
}
