import { FreshContext } from '$fresh/server.ts'
import { Container } from '../../components/library/Container.tsx'
import Layout from '../../components/library/Layout.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import PersonSearch from '../../islands/PersonSearch.tsx'
import * as patients from '../../db/models/patients.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as facilities from '../../db/models/facilities.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
  TrxOrDb,
} from '../../types.ts'
import { parseRequestAsserts } from '../../util/parseForm.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import FormButtons from '../../components/library/form/buttons.tsx'
import {
  RadioGroup,
  TextArea,
} from '../../components/library/form/Inputs.tsx'
import ProvidersSelect from '../../islands/ProvidersSelect.tsx'
import { assertOr400 } from '../../util/assertOr.ts'
import { hasName } from '../../util/haveNames.ts'
import Form from '../../components/library/form/Form.tsx'
import { EncounterReason } from '../../db.d.ts'
import { Button } from '../../components/library/Button.tsx'
import {useState} from 'preact/hooks'
import { PersonData } from '../../components/library/Person.tsx'

const [selectedPatient, setSelectedPatient] = useState<PersonData | undefined>(undefined)
const [isReturningPatient, setIsReturningPatient] = useState(false)

function handlePatientSearch(
  patient: PersonData | undefined,
){
  setSelectedPatient(patient)
}

async function checkReturningPatient(
  patient: PersonData | undefined,
  trx: TrxOrDb,
){
  if (patient && patient.id){
    if (patient.id != 'add'){
      const {completed_intake} = await patients.getByID(trx, {
        id: patient.id
      })
      setIsReturningPatient(completed_intake)
    }
  }
}

async function displayIntakeOrReviewPage(){

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
  let completed_intake: boolean | undefined
  if (patient_id) {
    const getting_open_encounter = patient_encounters.get(trx, {
      patient_id,
      encounter_id: 'open',
    })
    await completing_intake
    const fetched_patient = await patients.getByID(trx, {
      id: patient_id,
    })
    completed_intake = fetched_patient.completed_intake

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
      avatarUrl={state.healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='md'>
        <Form method='POST'>
          {open_encounter && (
            <input
              type='hidden'
              name='encounter_id'
              value={open_encounter.encounter_id}
            />
          )}
          <FormRow>
            <PersonSearch
              name='patient'
              href='/app/patients'
              required
              addable
              value={patient}
              disabled={!!patient}
              onSelect={handlePatientSearch}
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
              value={open_encounter?.reason || 'seeking treatment'}
            />
          </FormRow>
          <FormRow>
            <TextArea name='notes' />
          </FormRow>
          <FormRow>
          <FormButtons submitText='Add to waiting room'/>
          {selectedPatient && isReturningPatient && (
            <Button 
            href={`/app/patients/${selectedPatient.id}`}>
              Review and begin visit
            </Button>
          )}
          {selectedPatient && !isReturningPatient && (
            <Button>Start Intake</Button>
          )}
          </FormRow>

        </Form>
      </Container>
    </Layout>
  )
}
