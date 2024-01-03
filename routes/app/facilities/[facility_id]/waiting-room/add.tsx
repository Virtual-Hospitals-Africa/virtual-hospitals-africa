import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import FormRow from '../../../../../components/library/form/Row.tsx'
import PersonSearch from '../../../../../islands/PersonSearch.tsx'
import * as patients from '../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as facilities from '../../../../../db/models/facilities.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandler,
  Patient,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import redirect from '../../../../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import FormButtons from '../../../../../components/library/form/buttons.tsx'
import {
  RadioGroup,
  TextArea,
} from '../../../../../components/library/form/Inputs.tsx'
import ProvidersSelect from '../../../../../islands/ProvidersSelect.tsx'
import { assertOr400, assertOr404 } from '../../../../../util/assertOr.ts'
import { hasName } from '../../../../../util/haveNames.ts'

export const handler: LoggedInHealthWorkerHandler<Record<never, unknown>, {
  facility: { id: number; display_name: string }
}> = {
  async POST(req, ctx) {
    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)
    const to_create = await parseRequestAsserts(
      ctx.state.trx,
      req,
      patient_encounters.assertIsCreate,
    )
    const created = await patient_encounters.create(
      ctx.state.trx,
      facility_id,
      to_create,
    )
    return redirect(
      `/app/facilities/1/waiting-room?just_encountered_id=${created.id}`,
    )
  },
}

export default async function WaitingRoomAdd(
  _req: Request,
  { url, state, params, route }: FreshContext<LoggedInHealthWorker>,
) {
  const { trx } = state
  const { searchParams } = url
  const patient_id = parseInt(searchParams.get('patient_id')!) || null
  const patient_name = searchParams.get('patient_name')
  const just_completed_intake = url.searchParams.get('intake') === 'completed'

  let completing_intake: Promise<ReturnedSqlRow<Patient>> | undefined
  if (just_completed_intake) {
    assertOr400(patient_id, 'patient_id is required')
    completing_intake = patients.upsert(trx, {
      id: patient_id,
      completed_onboarding: true,
    })
  }

  const facility_id = parseInt(params.facility_id)
  assert(facility_id)

  const gettingProviders = facilities.getApprovedDoctorsAndNurses(trx, {
    facility_id,
  })

  let patient: { id?: number; name: string } | undefined
  if (patient_id) {
    const fetched_patient = await (completing_intake || patients.getByID(trx, {
      id: patient_id,
    }))
    assert(hasName(fetched_patient))
    patient = fetched_patient
  } else if (patient_name) {
    patient = { name: patient_name }
  }

  return (
    <Layout
      title={'Add patient to waiting room'}
      route={route}
      url={url}
      avatarUrl={state.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <form method='POST'>
          <FormRow>
            <PersonSearch
              name='patient'
              href='/app/patients'
              required
              addable
              value={patient}
            />
          </FormRow>
          <FormRow>
            <ProvidersSelect providers={await gettingProviders} />
          </FormRow>
          <FormRow>
            <RadioGroup
              name='reason'
              label='Reason for visit'
              options={patient_encounters.drop_in_reasons.map((
                value,
              ) => ({
                value,
              }))}
              value='seeking treatment'
            />
          </FormRow>
          <FormRow>
            <TextArea name='notes' />
          </FormRow>
          <FormButtons />
        </form>
      </Container>
    </Layout>
  )
}
