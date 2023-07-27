import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Media,
  Patient,
  ReturnedSqlRow,
  LoggedInHealthWorker
} from '../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import { HandlerContext } from '$fresh/src/server/mod.ts'
import * as patients from '../../../db/models/patients.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import { useAddPatientSteps } from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import PatientAddressForm from '../../../components/patients/add/AddressForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import compact from '../../../util/compact.ts'
import pick from '../../../util/pick.ts'
import isObjectLike from '../../../util/isObjectLike.ts'

type AddPatientProps = {
  healthWorker: HealthWorker
  patient: Partial<Patient>
}

type HasNames = {
  first_name: string
  last_name: string
  middle_names?: string
}

type HasAddress = {
  country: string
  province: string
  district: string
  ward: string
  street: string
}

function hasNames(
  patient: unknown,
): patient is HasNames & { avatar_media?: ReturnedSqlRow<Media> } {
  return isObjectLike(patient) && !!patient.first_name && !!patient.last_name
}

function hasAddress(
  patient: unknown,
): patient is HasAddress {
  return isObjectLike(patient) && !!patient.country && !!patient.province && !!patient.district && !!patient.ward && !!patient.street
}

const pickDemographics = pick([
  'phone_number',
  'gender',
  'date_of_birth',
  'national_id_number',
])

const pickAddress = pick([
  'country',
  'province',
  'district',
  'ward',
  'street'
])

const pickHealthCare = pick([
  'nearest_facility_id',
])

const SESSION_KEY = 'patient-data'

async function handlePersonalData(req: Request, ctx: HandlerContext<AddPatientProps, LoggedInHealthWorker>) {
  const patientData = await parseRequest(ctx.state.trx, req, hasNames)
  const patient = {
    step: 'personal',
    ...pickDemographics(patientData),
    name: compact([
      patientData.first_name,
      patientData.middle_names,
      patientData.last_name,
    ]).join(' '),
    avatar_media_id: patientData.avatar_media?.id,
  }
  ctx.state.session.set(SESSION_KEY, patient)
}

async function handleAddressData(req: Request, ctx: HandlerContext<AddPatientProps, LoggedInHealthWorker>) {
  const personalData = ctx.state.session.get(SESSION_KEY)
  const patientData = await parseRequest(ctx.state.trx, req, hasAddress)
  const patient = {
    ...personalData,
    step: 'address',
    ...pickAddress(patientData),
    ...pickHealthCare(patientData),
  }
  ctx.state.session.set(SESSION_KEY, patient)
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))
    return ctx.render({ healthWorker, patient: {} })
  },
  // TODO: support steps of the form other than personal
  async POST(req, ctx) {
    const step = new URL(req.url).searchParams.get('step') || 'personal'
    
    if (step === 'personal') {
      await handlePersonalData(req, ctx)
      return redirect('/app/patients/add?step=address')
    }

    if (step === 'address') {
      await handleAddressData(req, ctx)
    }

    const patient = ctx.state.session.get(SESSION_KEY)
    delete patient.step

    assert(patients.hasDemographicInfo(patient))
    await patients.upsert(ctx.state.trx, {
      ...patient,
      // TODO separate patient's whatsapp conversation_state from patients table
      conversation_state: 'initial_message',
    })
    return redirect('/app/patients/add?step=history')
  },
}

export default function AddPatient(
  props: PageProps<AddPatientProps>,
) {
  const { steps, currentStep } = useAddPatientSteps(props)

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        {steps}
        <form
          method='POST'
          className='w-full mt-4'
          encType='multipart/form-data'
        >
          {currentStep === 'personal' && <PatientPersonalForm />}
          {currentStep === 'address' && <PatientAddressForm />}
          {currentStep === 'history' && <div>TODO history form</div>}
          {currentStep === 'allergies' && <div>TODO allergies form</div>}
          {currentStep === 'age_related_questions' && <div>TODO age form</div>}
        </form>
      </Container>
    </Layout>
  )
}
