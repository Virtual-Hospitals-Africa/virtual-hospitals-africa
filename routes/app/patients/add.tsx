import { PageProps } from '$fresh/server.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  FullCountryInfo,
  LoggedInHealthWorkerHandler,
  Maybe,
  OnboardingPatient,
} from '../../../types.ts'
import * as patients from '../../../db/models/patients.ts'
import * as address from '../../../db/models/address.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import {
  AddPatientStep,
  useAddPatientSteps,
} from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import PatientAddressForm from '../../../components/patients/add/AddressForm.tsx'
import FamilyForm from '../../../components/patients/add/FamilyForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import PatientConditionsForm from '../../../components/patients/add/ConditionsForm.tsx'
import omit from '../../../util/omit.ts'
import Buttons from '../../../components/library/form/buttons.tsx'
import { assertOr400 } from '../../../util/assertOr.ts'
import { path } from '../../../util/path.ts'
import { assert } from 'std/assert/assert.ts'

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
      | 'history'
      | 'occupation'
      | 'family'
      | 'lifestyle'
    adminDistricts?: undefined
  } | {
    step: 'address'
    adminDistricts: FullCountryInfo
  })

type PersonalFormValues = {
  first_name: string
  last_name: string
  middle_names?: string
  avatar_media?: Maybe<{ id: number }>
  national_id_number: string
  phone_number?: string
}

type AddressFormValues = {
  country_id: number
  province_id: number
  district_id: number
  ward_id: number
  suburb_id?: Maybe<number>
  street: string
  nearest_facility_id: number
  primary_doctor_id: number
  primary_doctor_name: string
}

type ConditionsFormValues = {
  conditions: [ { 
    id: Maybe<number>
    condition_id: number
    start_date: Maybe<string>
    end_date: Maybe<string>
    removed: Maybe<boolean>
    cormorbidities: [{
      id: Maybe<number>
      cormorbidity_id: string
      removed: Maybe<boolean>
    }]
    medications: [{
      id: Maybe<number>
      medication_id: string
      dose: Maybe<string>
      intake_frequency: Maybe<string>
      removed: Maybe<boolean>
    }]
  }]
}

type FamilyFormValues = Record<string, unknown>
type HistoryFormValues = Record<string, unknown>
type OccupationFormValues = Record<string, unknown>
type LifestyleFormValues = Record<string, unknown>

function isPersonal(
  patient: unknown,
): patient is PersonalFormValues {
  return isObjectLike(patient) &&
    !!patient.first_name && typeof patient.first_name === 'string' &&
    !!patient.last_name && typeof patient.last_name === 'string' &&
    !!patient.national_id_number &&
    typeof patient.national_id_number === 'string'
}

function isAddress(
  patient: unknown,
): patient is AddressFormValues {
  return isObjectLike(patient) &&
    !!patient.country_id && typeof patient.country_id === 'number' &&
    !!patient.province_id && typeof patient.province_id === 'number' &&
    !!patient.district_id && typeof patient.district_id === 'number' &&
    !!patient.ward_id && typeof patient.ward_id === 'number' &&
    !!patient.street && typeof patient.street === 'string' &&
    !!patient.nearest_facility_id && typeof patient.nearest_facility_id ===
      'number' &&
    !!(patient.primary_doctor_id &&
        typeof patient.primary_doctor_id === 'number' ||
      patient.primary_doctor_name)
}

function isConditions(
  patient: unknown,
): patient is ConditionsFormValues {
  return true
}

function isFamily(
  patient: unknown,
): patient is FamilyFormValues {
  return true
}

function isHistory(
  patient: unknown,
): patient is HistoryFormValues {
  return true
}

function isOccupation(
  patient: unknown,
): patient is OccupationFormValues {
  return true
}

function isLifestyle(
  patient: unknown,
): patient is LifestyleFormValues {
  return true
}

type Forms = {
  personal: PersonalFormValues
  address: AddressFormValues
  'pre-existing_conditions': ConditionsFormValues
  family: FamilyFormValues
  history: HistoryFormValues
  occupation: OccupationFormValues
  lifestyle: LifestyleFormValues
}

type TypeCheckers = {
  [key in AddPatientStep]: (
    patient: unknown,
  ) => patient is Forms[key]
}

type Transformers = Partial<
  {
    [key in AddPatientStep]: (
      patient: Forms[key],
    ) => patients.UpsertablePatient
  }
>

const typeCheckers: TypeCheckers = {
  personal: isPersonal,
  address: isAddress,
  'pre-existing_conditions': isConditions,
  family: isFamily,
  history: isHistory,
  occupation: isOccupation,
  lifestyle: isLifestyle,
}

const transformers: Transformers = {
  personal: (
    { avatar_media, ...patient },
  ): patients.UpsertablePatient => ({
    ...patient,
    avatar_media_id: avatar_media?.id,
  }),
  address: (
    patient,
  ): patients.UpsertablePatient => ({
    nearest_facility_id: patient.nearest_facility_id,
    primary_doctor_id: isNaN(patient.primary_doctor_id)
      ? null
      : patient.primary_doctor_id,
    unregistered_primary_doctor_name: isNaN(patient.primary_doctor_id)
      ? patient.primary_doctor_name
      : null,
    address: {
      country_id: patient.country_id,
      province_id: patient.province_id,
      district_id: patient.district_id,
      ward_id: patient.ward_id,
      suburb_id: patient.suburb_id,
      street: patient.street,
    },
  }),
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  async GET(req, ctx) {
    const { healthWorker } = ctx.state
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step')

    let patient: OnboardingPatient | undefined

    let patient_id: undefined | number
    const patientIdStr = searchParams.get('patient_id')
    if (patientIdStr) {
      patient_id = parseInt(patientIdStr)
      assert(!isNaN(patient_id), 'Invalid patient ID')
    }

    if (!step) {
      return redirect(path('/app/patients/add', {
        step: 'personal',
        patient_id,
      }))
    }

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

    assertOr400(
      step === 'personal' ||
        step === 'pre-existing_conditions' || step === 'family' ||
        step === 'history' || step === 'occupation' || step === 'lifestyle',
    )
    return ctx.render({ healthWorker, patient, step })
  },
  async POST(req, ctx) {
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step')
    const id = searchParams.get('patient_id')

    assertOr400(
      step === 'personal' || step === 'address' ||
        step === 'pre-existing_conditions' || step === 'family' ||
        step === 'history' || step === 'occupation' || step === 'lifestyle',
    )

    const formData = await parseRequest(ctx.state.trx, req, typeCheckers[step])
    // deno-lint-ignore no-explicit-any
    const transformedFormData = transformers[step]?.(formData as any) ||
      formData

    const patient = await patients.upsert(ctx.state.trx, {
      ...transformedFormData,
      id: id ? parseInt(id) : undefined,
      completed_onboarding: step === 'lifestyle',
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
                display_name: healthWorker.employment[0].facility_display_name,
              }}
              adminDistricts={adminDistricts!}
            />
          )}
          {currentStep === 'family' && <FamilyForm patient={patient} />}
          {currentStep === 'pre-existing_conditions' && (
            <PatientConditionsForm patient={patient} />
          )}
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
