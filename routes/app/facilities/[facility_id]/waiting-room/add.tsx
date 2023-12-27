import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import FormRow from '../../../../../components/library/form/Row.tsx'
import PersonSearch from '../../../../../islands/PersonSearch.tsx'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import * as facilities from '../../../../../db/models/facilities.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandler,
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
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const { searchParams } = ctx.url
  const patient_id = parseInt(searchParams.get('patient_id')!) || null
  const patient_name = searchParams.get('patient_name')

  const facility_id = parseInt(ctx.params.facility_id)
  assert(facility_id)

  const providers = await facilities.getApprovedDoctorsAndNurses(
    ctx.state.trx,
    {
      facility_id,
    },
  )

  return (
    <Layout
      title={'Add patient to waiting room'}
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
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
              value={(patient_id && patient_name)
                ? { id: patient_id, name: patient_name }
                : undefined}
            />
          </FormRow>
          <FormRow>
            <ProvidersSelect providers={providers} />
          </FormRow>

          {
            /*
              TODO: Decide if we want to allow selection of providers from other facilities
              <PersonSearch
                name='provider'
                href={`/app/health_workers?facility_id=${facility_id}&profession=doctor,nurse&include_next_available=true`}
                required
                value={{ id: 'next_available', name: 'Next Available' }}
              />
            */
          }
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
