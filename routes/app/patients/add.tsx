import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  FullCountryInfo,
  LoggedInHealthWorkerHandler,
  Maybe,
  OnboardingPatient,
} from '../../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as patients from '../../../db/models/patients.ts'
import * as address from '../../../db/models/address.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import { useAddPatientSteps } from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import PatientAddressForm from '../../../components/patients/add/AddressForm.tsx'
import FamilyForm from '../../../components/patients/add/FamilyForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import PatientConditionsForm from '../../../components/patients/add/ConditionsForm.tsx'
import omit from '../../../util/omit.ts'
import Buttons from '../../../components/library/form/buttons.tsx'

type HasNames = {
  first_name: string
  last_name: string
  middle_names?: string
}

type AddPatientProps =
  & {
    patient?: OnboardingPatient
    healthWorker: EmployedHealthWorker
  }
  & ({
    step:
      | 'personal'
      | 'family'
      | 'pre-existing_conditions'
      | 'age_related_questions'
    adminDistricts?: undefined
  } | {
    step: 'address'
    adminDistricts: FullCountryInfo
  })

type HasAddress = {
  country_id: number
  province_id: number
  district_id: number
  ward_id: number
  suburb_id?: Maybe<number>
  street: string
}

function hasNames(
  patient: unknown,
): patient is HasNames {
  return isObjectLike(patient) &&
    !!patient.first_name && typeof patient.first_name === 'string' &&
    !!patient.last_name && typeof patient.last_name === 'string'
}

function hasAddress(
  patient: unknown,
): patient is HasAddress {
  return isObjectLike(patient) &&
    !!patient.country_id && typeof patient.country_id === 'number' &&
    !!patient.province_id && typeof patient.province_id === 'number' &&
    !!patient.district_id && typeof patient.district_id === 'number' &&
    !!patient.ward_id && typeof patient.ward_id === 'number' &&
    !!patient.street && typeof patient.street === 'string'
}

function hasConditions(
  patient: unknown,
): patient is Record<string, unknown> {
  return true
}

function hasFamily(
  patient: unknown,
): patient is Record<string, unknown> {
  return true
}

const typeCheckers = {
  personal: hasNames,
  address: hasAddress,
  'pre-existing_conditions': hasConditions,
  family: hasFamily,
}

const omitNames = omit(['nearest_facility_name', 'primary_doctor_name'])

const transformers = {
  personal: (
    { avatar_media, ...patient }: patients.UpsertablePatient & {
      avatar_media?: { id: number }
    },
  ): patients.UpsertablePatient => ({
    ...patient,
    avatar_media_id: avatar_media?.id,
  }),
  address: omitNames,
  'pre-existing_conditions': (patient: patients.UpsertablePatient) => patient,
  family: (patient: patients.UpsertablePatient) => patient,
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  async GET(req, ctx) {
    const { healthWorker } = ctx.state
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step')

    let patient: OnboardingPatient | undefined

    const patient_id = parseInt(searchParams.get('patient_id') || '0')

    if (!step) return redirect('/app/patients/add?step=personal')

    if (patient_id) {
      patient = await patients.getOnboarding(
        ctx.state.trx,
        { id: patient_id },
      )
    }

    if (step === 'address') {
      const adminDistricts = await address.getFullCountryInfo(ctx.state.trx)
      return ctx.render({
        healthWorker,
        patient,
        step,
        adminDistricts,
      })
    }
    assert(
      step === 'personal' || step === 'family' ||
        step === 'pre-existing_conditions' || step === 'age_related_questions',
    )
    return ctx.render({ healthWorker, patient, step })
  },
  async POST(req, ctx) {
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step')
    const id = searchParams.get('patient_id')

    assert(
      step === 'personal' || step === 'address' ||
        step === 'pre-existing_conditions' || step === 'family',
      `${step} not supported`,
    )

    const formData = await parseRequest(ctx.state.trx, req, typeCheckers[step])

    const transformedFormData = transformers[step](formData)

    const patient = await patients.upsert(ctx.state.trx, {
      ...transformedFormData,
      id: id ? parseInt(id) : undefined,
      completed_onboarding: step === 'family',
    })

    if (step === 'personal') {
      return redirect(`/app/patients/add?step=address&patient_id=${patient.id}`)
    }

    if (step === 'address') {
      return redirect(
        `/app/patients/add?step=pre-existing_conditions&patient_id=${patient.id}`,
      )
    }

    if (step === 'pre-existing_conditions') {
      return redirect('/app/patients/add?step=family')
    }

    if (step === 'family') {
      const success = encodeURIComponent(
        `Awesome! ${patient.name} has finished onboarding!`,
      )
      return redirect(`/app/patients?success=${success}`)
    }

    return redirect('/app/patients/add?step=family')
  },
}

export default function AddPatient(
  props: PageProps<AddPatientProps>,
) {
  const { stepsTopBar, currentStep } = useAddPatientSteps(props)
  const { patient, healthWorker, adminDistricts } = props.data

  return (
    <Layout
      title='Add Patient'
      route={props.route}
      url={props.url}
      avatarUrl={healthWorker.avatar_url}
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
            <PatientPersonalForm patient={patient} />
          )}
          {currentStep === 'address' && (
            <PatientAddressForm
              patient={patient}
              defaultFacility={{
                id: healthWorker.employment[0].facility_id,
                name: healthWorker.employment[0].facility_name,
              }}
              adminDistricts={adminDistricts!}
            />
          )}
          {currentStep === 'family' && <FamilyForm patient={patient} />}
          {currentStep === 'pre-existing_conditions' && (
            <PatientConditionsForm patient={patient} />
          )}
          {currentStep === 'age_related_questions' && <div>TODO age form</div>}
          <hr className='my-2' />
          <Buttons
            submitText='Next Step'
            cancelHref='/app/patients'
          />
        </form>
      </Container>
    </Layout>
  )
}
