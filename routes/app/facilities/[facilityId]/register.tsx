import {
  Facility,
  FullCountryInfo,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import { NurseRegistrationDetails } from '../../../../types.ts'
import { assert } from 'std/assert/assert.ts'
import {
  getStepFormData,
  NurseRegistrationStep,
  NurseRegistrationStepNames,
  useNurseRegistrationSteps,
} from '../../../../components/health_worker/nurse/invite/Steps.tsx'
import redirect from '../../../../util/redirect.ts'
import { PageProps } from '$fresh/server.ts'
import { Container } from '../../../../components/library/Container.tsx'
import * as employment from '../../../../db/models/employment.ts'
import * as nurse_specialties from '../../../../db/models/nurse_specialties.ts'
import * as nurse_registration_details from '../../../../db/models/nurse_registration_details.ts'
import * as address from '../../../../db/models/address.ts'
import {
  DocumentFormFields,
  PersonalFormFields,
  ProfessionalInformationFields,
} from '../../../../components/health_worker/nurse/invite/Steps.tsx'
import NurseRegistrationForm from '../../../../islands/nurse-registration-form.tsx'

type RegisterPageProps = {
  formState: FormState
  adminDistricts: FullCountryInfo | undefined
}

export type FormState =
  & PersonalFormFields
  & ProfessionalInformationFields
  & DocumentFormFields

export const handler: LoggedInHealthWorkerHandler<RegisterPageProps, {
  facility: ReturnedSqlRow<Facility>
}> = {
  async GET(req, ctx) {
    const { healthWorker, facility } = ctx.state

    const step = new URL(req.url).searchParams.get('step')
    // TODO: Further make this handling of multistep forms generic
    if (
      !NurseRegistrationStepNames.includes(
        step as unknown as NurseRegistrationStep,
      )
    ) {
      return redirect(`/app/facilities/${facility.id}/register?step=personal`)
    }

    const registrationFormState = ctx.state.session.get('registrationFormState')

    const formState = registrationFormState
      ? JSON.parse(registrationFormState)
      : {} as FormState

    formState.email = healthWorker.email

    const adminDistricts = step == 'personal'
      ? await address.getFullCountryInfo(ctx.state.trx)
      : undefined

    return ctx.render({ formState, adminDistricts })
  },
  async POST(req, ctx) {
    const employee = await employment.getEmployee(ctx.state.trx, {
      facility_id: ctx.state.facility.id,
      health_worker_id: ctx.state.healthWorker.id,
    })
    assert(employee)

    const step = new URL(req.url).searchParams.get('step')
    assert(step)

    const priorFormState: FormState = JSON.parse(
      ctx.state.session.get('registrationFormState') || '{}',
    )

    const newFormState = await getStepFormData(
      step,
      ctx.state.trx,
      req,
    )

    const formState = {
      ...priorFormState,
      ...newFormState,
    }

    const stepIndex = NurseRegistrationStepNames.findIndex((name) =>
      name === step
    )

    if (stepIndex < NurseRegistrationStepNames.length - 1) {
      ctx.state.session.set('registrationFormState', JSON.stringify(formState))
      const nextStep = NurseRegistrationStepNames[stepIndex + 1]
      const nextPage = new URL(req.url)
      nextPage.searchParams.set('step', nextStep)
      return redirect(nextPage.toString())
    }

    await nurse_specialties.add(ctx.state.trx, {
      employee_id: employee.id,
      specialty: formState.specialty,
    })

    const nurse_address = await address.upsertAddress(ctx.state.trx, {
      country_id: formState.country_id,
      province_id: formState.province_id,
      district_id: formState.district_id,
      ward_id: formState.ward_id,
      sururb_id: formState.suburb_id,
      street: formState.street,
    } as address.UpsertableAddress)

    await nurse_registration_details.add(ctx.state.trx, {
      registrationDetails: getRegistrationDetails(
        ctx.state.healthWorker,
        formState,
        nurse_address.id,
      ),
    })

    ctx.state.session.set('registrationFormState', undefined)

    return redirect('/app')
  },
}

function getRegistrationDetails(
  healthWorker: HealthWorkerWithGoogleTokens,
  formState: FormState,
  nurse_address_id: number,
): NurseRegistrationDetails {
  return {
    health_worker_id: healthWorker.id,
    gender: formState.gender,
    date_of_birth: formState.date_of_birth,
    national_id_number: formState.national_id_number,
    date_of_first_practice: formState.date_of_first_practice,
    ncz_registration_number: formState.ncz_registration_number,
    mobile_number: formState.mobile_number,
    face_picture_media_id: formState.face_picture?.id,
    ncz_registration_card_media_id: formState.ncz_registration_card?.id,
    national_id_media_id: formState.national_id_picture?.id,
    nurse_practicing_cert_media_id: formState.nurse_practicing_cert?.id,
    approved_by: null,
    address_id: nurse_address_id,
  }
}

export default function register(
  props: PageProps<RegisterPageProps>,
) {
  const stepState = useNurseRegistrationSteps(props)

  return (
    <Container size='lg'>
      {stepState.stepsTopBar}
      <NurseRegistrationForm
        currentStep={stepState.currentStep}
        formData={props.data.formState}
        adminDistricts={props.data.adminDistricts}
      />
    </Container>
  )
}
