import { PageProps } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../components/library/Layout.tsx'
import {
  EmployedHealthWorker,
  FamilyRelation,
  FullCountryInfo,
  LoggedInHealthWorkerHandler,
  Maybe,
  OnboardingPatient,
  PatientFamily,
  PreExistingAllergy,
  PreExistingConditionWithDrugs,
} from '../../../types.ts'
import * as patients from '../../../db/models/patients.ts'
import * as address from '../../../db/models/address.ts'
import * as patient_conditions from '../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../db/models/patient_allergies.ts'
import * as patient_family from '../../../db/models/family.ts'
import redirect from '../../../util/redirect.ts'
import { Container } from '../../../components/library/Container.tsx'
import {
  getNextStep,
  isStep,
  useAddPatientSteps,
} from '../../../components/patients/add/Steps.tsx'
import PatientPersonalForm from '../../../components/patients/add/PersonalForm.tsx'
import PatientAddressForm from '../../../components/patients/add/AddressForm.tsx'
import PatientOccupationForm from '../../../components/patients/add/OccupationForm.tsx'
import PatientReview from '../../../components/patients/add/Review.tsx'
import FamilyForm from '../../../components/patients/add/FamilyForm.tsx'
import { parseRequest } from '../../../util/parseForm.ts'
import isObjectLike from '../../../util/isObjectLike.ts'
import PatientPreExistingConditions from '../../../components/patients/add/PreExistingConditionsForm.tsx'
import Buttons from '../../../components/library/form/buttons.tsx'
import { assertOr400, assertOr404 } from '../../../util/assertOr.ts'
import omit from '../../../util/omit.ts'

type AddPatientProps =
  & {
    patient?: OnboardingPatient
    healthWorker: EmployedHealthWorker
  }
  & ({
    step:
      | 'personal'
      | 'history'
      | 'occupation'
      | 'family'
      | 'lifestyle'
      | 'review'
    adminDistricts?: undefined
    preExistingConditions?: undefined
    initialDrugs?: undefined
    allergies?: undefined
    family?: undefined
  } | {
    step: 'address'
    adminDistricts: FullCountryInfo
    preExistingConditions?: undefined
    initialDrugs?: undefined
    allergies?: undefined
    family?: undefined
  } | {
    step: 'pre-existing_conditions'
    adminDistricts?: undefined
    preExistingConditions: PreExistingConditionWithDrugs[]
    allergies?: PreExistingAllergy[]
    family?: undefined
  } | {
    step: 'family'
    adminDistricts?: undefined
    preExistingConditions?: undefined
    initialDrugs?: undefined
    allergies?: undefined
    family: PatientFamily
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
  allergy_search?: string
  allergies?: PreExistingAllergy[]
  pre_existing_conditions?: patient_conditions.PreExistingConditionUpsert[]
}

type FamilyFormValues = {
  family?: {
    guardians?: FamilyRelation[]
    dependents?: FamilyRelation[]
  }
}
type HistoryFormValues = Record<string, unknown>
type OccupationFormValues = {
  school?: Maybe<Record<string, unknown>>
}
type LifestyleFormValues = Record<string, unknown>
type ReviewFormValues = { completed_onboarding: boolean }

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
  return isObjectLike(patient) &&
    isObjectLike(patient.occupation)
}

function isLifestyle(
  patient: unknown,
): patient is LifestyleFormValues {
  return true
}

function isReview(
  patient: unknown,
): patient is ReviewFormValues {
  return isObjectLike(patient) &&
    typeof patient.completed_onboarding === 'boolean' &&
    patient.completed_onboarding
}

type FormValuesByStep = {
  personal: PersonalFormValues
  address: AddressFormValues
  'pre-existing_conditions': ConditionsFormValues
  family: FamilyFormValues
  history: HistoryFormValues
  occupation: OccupationFormValues
  lifestyle: LifestyleFormValues
  review: ReviewFormValues
}

type FormValues = FormValuesByStep[keyof FormValuesByStep]
type TypeCheckers = {
  [key in keyof FormValuesByStep]: (
    patient: unknown,
  ) => patient is FormValuesByStep[key]
}

const typeCheckers: TypeCheckers = {
  personal: isPersonal,
  address: isAddress,
  'pre-existing_conditions': isConditions,
  family: isFamily,
  history: isHistory,
  occupation: isOccupation,
  lifestyle: isLifestyle,
  review: isReview,
}

type Transformers = Partial<
  {
    [key in keyof FormValuesByStep]: (
      patient: FormValuesByStep[key],
    ) => patients.UpsertablePatient
  }
>

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
  'pre-existing_conditions': (
    patient,
  ): patients.UpsertablePatient => ({
    ...omit(patient, ['allergy_search']),
    pre_existing_conditions: patient.pre_existing_conditions || [],
    allergies: patient.allergies || [],
  }),
  'family': (
    patient,
  ): patients.UpsertablePatient => ({
    family: {
      guardians: patient?.family?.guardians || [],
      dependents: patient?.family?.dependents || [],
    },
  }),
}

export const handler: LoggedInHealthWorkerHandler<AddPatientProps> = {
  async GET(req, ctx) {
    const { healthWorker } = ctx.state
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step') || 'personal'
    assertOr404(isStep(step))

    let patient: OnboardingPatient | undefined

    let patient_id: undefined | number
    const patientIdStr = searchParams.get('patient_id')
    if (patientIdStr) {
      patient_id = parseInt(patientIdStr)
      assert(!isNaN(patient_id), 'Invalid patient ID')
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

    if (step === 'pre-existing_conditions') {
      const gettingPreExistingConditions = patient_id
        ? patient_conditions
          .getPreExistingConditionsWithDrugs(
            ctx.state.trx,
            { patient_id },
          )
        : Promise.resolve([])

      const gettingAllergies = patient_id
        ? patient_allergies
          .getWithName(
            ctx.state.trx,
            patient_id,
          )
        : Promise.resolve([])

      return ctx.render({
        healthWorker,
        patient,
        step,
        preExistingConditions: await gettingPreExistingConditions,
        allergies: await gettingAllergies,
      })
    }

    if (step === 'family') {
      const gettingFamily = patient_family
        .get(
          ctx.state.trx,
          { patient_id: patient_id! },
        )

      return ctx.render({
        healthWorker,
        patient,
        step,
        family: await gettingFamily,
      })
    }

    assertOr400(
      step === 'personal' ||
        step === 'history' || step === 'occupation' || step === 'lifestyle',
    )
    return ctx.render({ healthWorker, patient, step })
  },
  async POST(req, ctx) {
    const { searchParams } = new URL(req.url)
    const step = searchParams.get('step') || 'personal'
    const patient_id = searchParams.get('patient_id')

    assertOr400(isStep(step))

    const formData = await parseRequest(ctx.state.trx, req, typeCheckers[step])

    // deno-lint-ignore no-explicit-any
    const transformedFormData = transformers[step]?.(formData as any) ||
      formData

    const patient = await patients.upsert(ctx.state.trx, {
      ...transformedFormData,
      id: (patient_id && parseInt(patient_id)) || undefined,
    })

    if (patient.completed_onboarding) {
      const success = encodeURIComponent(
        `Awesome! ${patient.name} has finished onboarding!`,
      )
      return redirect(`/app/patients?success=${success}`)
    }

    return redirect(
      `/app/patients/add?step=${getNextStep(step)}&patient_id=${patient.id}`,
    )
  },
}

export default function AddPatient(
  props: PageProps<AddPatientProps>,
) {
  const { stepsTopBar, currentStep } = useAddPatientSteps(props)
  const {
    patient,
    healthWorker,
    adminDistricts,
    preExistingConditions,
    allergies,
    family,
  } = props.data

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
          {currentStep === 'family' && (
            <FamilyForm patient={patient} family={(assert(family), family)} />
          )}
          {currentStep === 'pre-existing_conditions' && (
            <PatientPreExistingConditions
              patient={patient}
              allergies={(assert(allergies), allergies)}
              preExistingConditions={(assert(preExistingConditions),
                preExistingConditions)}
            />
          )}
          {currentStep === 'history' && <div>TODO History</div>}
          {currentStep === 'occupation' && (
            <PatientOccupationForm patient={patient} />
          )}
          {currentStep === 'review' && <PatientReview patient={patient!} />}
          <hr className='my-2' />
          <Buttons
            submitText={currentStep === 'review'
              ? 'Continue to vitals'
              : 'Next Step'}
            cancel={currentStep === 'review'
              ? {
                href: `/app/facilities/${
                  healthWorker.employment[0].facility_id
                }/waiting-room/add?patient_id=${patient!.id}&intake=completed`,
                text: 'Add patient to waiting room',
              }
              : undefined}
          />
        </form>
      </Container>
    </Layout>
  )
}
