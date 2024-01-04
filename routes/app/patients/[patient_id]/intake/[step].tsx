import Layout from '../../../../../components/library/Layout.tsx'
import {
  FamilyRelationInsert,
  FullCountryInfo,
  LoggedInHealthWorkerContext,
  LoggedInHealthWorkerHandler,
  Maybe,
  PatientFamily,
  PreExistingAllergy,
  PreExistingConditionWithDrugs,
  TrxOrDb,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import * as address from '../../../../../db/models/address.ts'
import * as patient_conditions from '../../../../../db/models/patient_conditions.ts'
import * as patient_allergies from '../../../../../db/models/patient_allergies.ts'
import * as patient_family from '../../../../../db/models/family.ts'
import redirect from '../../../../../util/redirect.ts'
import { Container } from '../../../../../components/library/Container.tsx'
import {
  getNextStep,
  isStep,
  useIntakePatientSteps,
} from '../../../../../components/patients/intake/Steps.tsx'
import PatientPersonalForm from '../../../../../components/patients/intake/PersonalForm.tsx'
import PatientAddressForm from '../../../../../components/patients/intake/AddressForm.tsx'
import PatientOccupationForm from '../../../../../components/patients/intake/OccupationForm.tsx'
import PatientReview from '../../../../../components/patients/intake/Review.tsx'
import FamilyForm from '../../../../../components/patients/intake/FamilyForm.tsx'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import PatientPreExistingConditions from '../../../../../components/patients/intake/PreExistingConditionsForm.tsx'
import Buttons from '../../../../../components/library/form/buttons.tsx'
import { assertOr400, assertOr404 } from '../../../../../util/assertOr.ts'
import omit from '../../../../../util/omit.ts'
import getNumericParam from '../../../../../util/getNumericParam.ts'
import Form from '../../../../../components/library/form/Form.tsx'

type IntakePatientProps = {
  step:
    | 'personal'
    | 'history'
    | 'occupation'
    | 'lifestyle'
    | 'review'
} | {
  step: 'address'
  adminDistricts: FullCountryInfo
} | {
  step: 'pre-existing_conditions'
  preExistingConditions: PreExistingConditionWithDrugs[]
  allergies: PreExistingAllergy[]
} | {
  step: 'family'
  family: PatientFamily
}

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
    guardians?: FamilyRelationInsert[]
    dependents?: FamilyRelationInsert[]
  }
}
type HistoryFormValues = Record<string, unknown>
type OccupationFormValues = {
  school?: Maybe<Record<string, unknown>>
}
type LifestyleFormValues = Record<string, unknown>
type ReviewFormValues = { completed_onboarding: boolean }

function assertIsPersonal(
  patient: unknown,
): asserts patient is PersonalFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(!!patient.first_name && typeof patient.first_name === 'string')
  assertOr400(!!patient.last_name && typeof patient.last_name === 'string')
  assertOr400(!!patient.national_id_number)
  assertOr400(typeof patient.national_id_number === 'string')
}

function assertIsAddress(
  patient: unknown,
): asserts patient is AddressFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(!!patient.country_id && typeof patient.country_id === 'number')
  assertOr400(!!patient.province_id && typeof patient.province_id === 'number')
  assertOr400(!!patient.district_id && typeof patient.district_id === 'number')
  assertOr400(!!patient.ward_id && typeof patient.ward_id === 'number')
  assertOr400(!!patient.street && typeof patient.street === 'string')
  assertOr400(
    !!patient.nearest_facility_id &&
      typeof patient.nearest_facility_id === 'number',
  )
  assertOr400(
    !!(patient.primary_doctor_id &&
      typeof patient.primary_doctor_id === 'number') ||
      patient.primary_doctor_name,
  )
}

function assertIsConditions(
  patient: unknown,
): asserts patient is ConditionsFormValues {
  // assertOr400(isObjectLike(patient))
}

function assertIsFamily(
  patient: unknown,
): asserts patient is FamilyFormValues {
  assertOr400(isObjectLike(patient))
}

function assertIsHistory(
  patient: unknown,
): asserts patient is HistoryFormValues {
  assertOr400(isObjectLike(patient))
}

function assertIsOccupation(
  patient: unknown,
): asserts patient is OccupationFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(isObjectLike(patient.occupation))
}

function assertIsLifestyle(
  patient: unknown,
): asserts patient is LifestyleFormValues {
  assertOr400(isObjectLike(patient))
}

function assertIsReview(
  patient: unknown,
): asserts patient is ReviewFormValues {
  assertOr400(isObjectLike(patient))
  assertOr400(
    typeof patient.completed_onboarding === 'boolean' &&
      patient.completed_onboarding,
  )
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
type TypeCheckers = {
  [key in keyof FormValuesByStep]: (
    patient: unknown,
  ) => asserts patient is FormValuesByStep[key]
}

const typeCheckers: TypeCheckers = {
  personal: assertIsPersonal,
  address: assertIsAddress,
  'pre-existing_conditions': assertIsConditions,
  family: assertIsFamily,
  history: assertIsHistory,
  occupation: assertIsOccupation,
  lifestyle: assertIsLifestyle,
  review: assertIsReview,
}

type Transformers = Partial<
  {
    [key in keyof FormValuesByStep]: (
      patient: FormValuesByStep[key],
    ) => Omit<patients.UpsertPatientIntake, 'id'>
  }
>

const transformers: Transformers = {
  personal: (
    { avatar_media, ...patient },
  ): Omit<patients.UpsertPatientIntake, 'id'> => ({
    ...patient,
    avatar_media_id: avatar_media?.id,
  }),
  address: (
    patient,
  ): Omit<patients.UpsertPatientIntake, 'id'> => ({
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
  ): Omit<patients.UpsertPatientIntake, 'id'> => ({
    ...omit(patient, ['allergy_search']),
    pre_existing_conditions: patient.pre_existing_conditions || [],
    allergies: patient.allergies || [],
  }),
  'family': (
    patient,
  ): Omit<patients.UpsertPatientIntake, 'id'> => ({
    family: {
      guardians: patient?.family?.guardians || [],
      dependents: patient?.family?.dependents || [],
    },
  }),
}

export const handler: LoggedInHealthWorkerHandler<IntakePatientProps> = {
  async POST(req, ctx) {
    const { step } = ctx.params
    const patient_id = getNumericParam(ctx, 'patient_id')

    assertOr400(isStep(step))

    const formData = await parseRequestAsserts(
      ctx.state.trx,
      req,
      typeCheckers[step],
    )

    // deno-lint-ignore no-explicit-any
    const transformedFormData = transformers[step]?.(formData as any) ||
      formData

    await patients.upsertIntake(ctx.state.trx, {
      ...transformedFormData,
      id: patient_id,
    })

    const redirect_to = transformedFormData.completed_onboarding
      ? `/app/patients/${patient_id}/encounters/open/vitals`
      : `/app/patients/${patient_id}/intake/${getNextStep(step)}`

    return redirect(redirect_to)
  },
}

async function getIntakePatientProps(
  trx: TrxOrDb,
  patient_id: number,
  step: IntakePatientProps['step'],
): Promise<IntakePatientProps> {
  switch (step) {
    case 'address': {
      const adminDistricts = await address.getFullCountryInfo(trx)
      return { step, adminDistricts }
    }
    case 'pre-existing_conditions': {
      const gettingPreExistingConditions = patient_conditions
        .getPreExistingConditionsWithDrugs(
          trx,
          { patient_id },
        )

      const gettingAllergies = patient_allergies
        .getWithName(
          trx,
          patient_id,
        )

      return {
        step,
        preExistingConditions: await gettingPreExistingConditions,
        allergies: await gettingAllergies,
      }
    }
    case 'family': {
      const family = await patient_family.get(trx, { patient_id })
      return { step, family }
    }
    default:
      return { step }
  }
}

export default async function IntakePatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const patient_id = getNumericParam(ctx, 'patient_id')
  const { step } = ctx.params
  assertOr404(isStep(step))

  const { trx, healthWorker } = ctx.state

  const patient = await patients.getOnboarding(trx, { id: patient_id })
  assertOr404(patient, 'Patient not found')

  const props = await getIntakePatientProps(trx, patient_id, step)
  const { stepsTopBar } = useIntakePatientSteps(ctx)

  return (
    <Layout
      title='Intake Patient'
      route={ctx.route}
      url={ctx.url}
      avatarUrl={ctx.state.healthWorker.avatar_url}
      variant='form'
    >
      <Container size='lg'>
        {stepsTopBar}
        <Form
          method='POST'
          className='w-full'
          encType='multipart/form-data'
        >
          {props.step === 'personal' && (
            <PatientPersonalForm patient={patient} />
          )}
          {props.step === 'address' && (
            <PatientAddressForm
              patient={patient}
              defaultFacility={{
                id: healthWorker.employment[0].facility_id,
                display_name: healthWorker.employment[0].facility_display_name,
              }}
              adminDistricts={props.adminDistricts}
            />
          )}
          {props.step === 'family' && (
            <FamilyForm patient={patient} family={props.family} />
          )}
          {props.step === 'pre-existing_conditions' && (
            <PatientPreExistingConditions
              patient={patient}
              allergies={props.allergies}
              preExistingConditions={props.preExistingConditions}
            />
          )}
          {props.step === 'occupation' && (
            <PatientOccupationForm patient={patient} />
          )}
          {props.step === 'history' && <div>TODO History</div>}
          {props.step === 'review' && <PatientReview patient={patient} />}
          <hr className='my-2' />
          <Buttons
            submitText={props.step === 'review'
              ? 'Continue to vitals'
              : 'Next Step'}
            cancel={props.step === 'review'
              ? {
                href: `/app/facilities/${
                  healthWorker.employment[0].facility_id
                }/waiting-room/add?patient_id=${patient.id}&intake=completed`,
                text: 'Add patient to waiting room',
              }
              : undefined}
          />
        </Form>
      </Container>
    </Layout>
  )
}
