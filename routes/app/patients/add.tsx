import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  AdminDistricts,
  Facility,
  HealthWorker,
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandler,
  Media,
  PatientAddress,
  PatientFamily,
  PatientPersonal,
  ReturnedSqlRow,
} from '../../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { HandlerContext } from '$fresh/src/server/mod.ts'
import * as patients from '../../../db/models/patients.ts'
import * as address from '../../../db/models/address.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../db/models/health_workers.ts'
import * as facilities from '../../../db/models/facilities.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import {
  getNextStep,
  useAddPatientSteps,
} from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import PatientAddressForm from '../../../components/patients/add/AddressForm.tsx'
import FamilyForm from '../../../components/patients/add/FamilyForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import compact from '../../../util/compact.ts'
import pick from '../../../util/pick.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import PatientConditionsForm from '../../../components/patients/add/ConditionsForm.tsx'

export type AddPatientDataProps = {
  personal: Omit<PatientPersonal, 'name'> & HasNames
  address: PatientAddress
  family: PatientFamily
}

type AddPatientProps = {
  healthWorker: HealthWorker & {
    facility?: ReturnedSqlRow<Facility>
  }
  patient: AddPatientDataProps
  adminDistricts?: AdminDistricts
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
  suburb?: string
  street: string
}

function hasNames(
  patient: unknown,
): patient is HasNames & {
  avatar_media?: ReturnedSqlRow<Media> & { name: string }
} {
  return isObjectLike(patient) && !!patient.first_name && !!patient.last_name
}

function hasAddress(
  patient: unknown,
): patient is HasAddress {
  return isObjectLike(patient) && !!patient.country && !!patient.province &&
    !!patient.district && !!patient.ward && !!patient.street
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
  'suburb',
  'street',
])

const pickHealthCare = pick([
  'nearest_facility_id',
])

const PATIENT_SESSION_KEY = 'patient-data'

async function handlePersonalData(
  req: Request,
  ctx: HandlerContext<AddPatientProps, LoggedInHealthWorker>,
) {
  const { personal } = ctx.state.session.get(PATIENT_SESSION_KEY) || {}
  const patientData = await parseRequest(ctx.state.trx, req, hasNames)
  const patient = {
    step: 'personal',
    personal: {
      ...pickDemographics(patientData),
      first_name: patientData.first_name,
      middle_names: patientData.middle_names,
      last_name: patientData.last_name,
      avatar_media_id: patientData.avatar_media?.id ||
        personal?.avatar_media_id,
      avatar_media_name: patientData.avatar_media?.name ||
        personal?.avatar_media_name,
    },
  }
  ctx.state.session.set(PATIENT_SESSION_KEY, patient)
}

async function handleAddressData(
  req: Request,
  ctx: HandlerContext<AddPatientProps, LoggedInHealthWorker>,
) {
  const personalData = ctx.state.session.get(PATIENT_SESSION_KEY)
  const patientData = await parseRequest(ctx.state.trx, req, hasAddress)
  const patient = {
    ...personalData,
    step: 'address',
    address: {
      ...pickAddress(patientData),
      ...pickHealthCare(patientData),
    },
  }
  ctx.state.session.set(PATIENT_SESSION_KEY, patient)
}

async function storePatientData(
  _req: Request,
  ctx: HandlerContext<AddPatientProps, LoggedInHealthWorker>,
) {
  const { personal, address } = ctx.state.session.get(PATIENT_SESSION_KEY)

  const personalData = {
    ...pickDemographics(personal),
    name: compact([
      personal.first_name,
      personal.middle_names,
      personal.last_name,
    ]).join(' '),
    avatar_media_id: personal.avatar_media_id,
  }
  assert(patients.hasDemographicInfo(personalData))

  await patients.upsert(ctx.state.trx, {
    ...personalData,
    ...address,
    // TODO separate patient's whatsapp conversation_state from patients table
    conversation_state: 'initial_message',
  })
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  async GET(req, ctx) {
    const { healthWorker } = ctx.state
    const urlStep = new URL(req.url).searchParams.get('step')
    const { step, ...patient } = ctx.state.session.get(PATIENT_SESSION_KEY) ||
      {}
    const cachedLastStep = step
    if (!urlStep && cachedLastStep) {
      const nextStep = getNextStep(cachedLastStep)
      return redirect(`/app/patients/add?step=${nextStep}`)
    }
    if (urlStep === 'address') {
      const adminDistricts = await address.getAll(ctx.state.trx)
      const facility = await facilities.getFirstByHealthWorker(
        ctx.state.trx,
        healthWorker.id,
      )
      assert(facility, 'Health worker not employed at any facility')
      return ctx.render({
        healthWorker: { ...healthWorker, facility },
        patient,
        adminDistricts,
      })
    }
    return ctx.render({ healthWorker, patient })
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

    await storePatientData(req, ctx)
    ctx.state.session.set(PATIENT_SESSION_KEY, undefined)
    return redirect('/app/patients/add?step=family')
  },
}

export default function AddPatient(
  props: PageProps<AddPatientProps>,
) {
  const { stepsTopBar, currentStep } = useAddPatientSteps(props)
  const { patient, healthWorker: { facility }, adminDistricts } = props.data

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        {stepsTopBar}
        <form
          method='POST'
          className='w-full mt-4'
          encType='multipart/form-data'
        >
          {currentStep === 'personal' && (
            <PatientPersonalForm initialData={patient.personal} />
          )}
          {currentStep === 'address' && (
            <PatientAddressForm
              defaultFacility={facility}
              adminDistricts={adminDistricts}
            />
          )}
          {currentStep === 'family' && (
            <FamilyForm initialData={patient.family} />
          )}
          {currentStep === 'pre-existing_conditions' && (
            <PatientConditionsForm />
          )}
          {currentStep === 'age_related_questions' && <div>TODO age form</div>}
        </form>
      </Container>
    </Layout>
  )
}
