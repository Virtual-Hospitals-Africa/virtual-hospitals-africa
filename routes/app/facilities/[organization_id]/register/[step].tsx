import { assert } from 'std/assert/assert.ts'
import {
  CountryAddressTree,
  Facility,
  HasId,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../types.ts'
import {
  getStepFormData,
  NurseRegistrationStep,
  NurseRegistrationStepNames,
  useNurseRegistrationSteps,
} from '../../../../../components/health_worker/nurse/invite/Steps.tsx'
import redirect from '../../../../../util/redirect.ts'
import * as employment from '../../../../../db/models/employment.ts'
import * as nurse_specialties from '../../../../../db/models/nurse_specialties.ts'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as nurse_registration_details from '../../../../../db/models/nurse_registration_details.ts'
import * as address from '../../../../../db/models/address.ts'
import {
  DocumentFormFields,
  PersonalFormFields,
  ProfessionalInformationFields,
} from '../../../../../components/health_worker/nurse/invite/Steps.tsx'
import NurseRegistrationForm from '../../../../../islands/nurse-registration-form.tsx'
import compact from '../../../../../util/compact.ts'
import { FacilityContext } from '../_middleware.ts'
import omit from '../../../../../util/omit.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'

type RegisterPageProps = {
  formState: FormState
  country_address_tree: CountryAddressTree | undefined
}

export type FormState =
  & PersonalFormFields
  & ProfessionalInformationFields
  & DocumentFormFields

export const handler: LoggedInHealthWorkerHandlerWithProps<RegisterPageProps, {
  organization: HasId<Facility>
}> = {
  async POST(req, ctx) {
    const employee = await employment.getEmployee(ctx.state.trx, {
      organization_id: ctx.state.organization.id,
      health_worker_id: ctx.state.healthWorker.id,
    })
    assert(employee)

    const { step } = ctx.params

    const priorFormState: Partial<FormState> = JSON.parse(
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
      const nextUrl = ctx.url.pathname.replace(`/${step}`, `/${nextStep}`)
      return redirect(nextUrl)
    }

    assert(formState.specialty)

    await nurse_specialties.add(ctx.state.trx, {
      employee_id: employee.id,
      specialty: formState.specialty,
    })

    const registrationDetails = getRegistrationDetails(
      ctx.state.healthWorker,
      omit(formState, [
        'first_name',
        'middle_names',
        'last_name',
        'specialty',
      ]) as FormState,
    )

    const fullNameInForm = compact([
      formState.first_name,
      formState.middle_names,
      formState.last_name,
    ]).join(' ')
    if (fullNameInForm !== ctx.state.healthWorker.name) {
      await health_workers.updateName(
        ctx.state.trx,
        ctx.state.healthWorker.id,
        fullNameInForm,
      )
    }

    await nurse_registration_details.add(ctx.state.trx, registrationDetails)

    ctx.state.session.set('registrationFormState', undefined)

    return redirect('/app')
  },
}

function getRegistrationDetails(
  healthWorker: HealthWorkerWithGoogleTokens,
  {
    face_picture,
    ncz_registration_card,
    national_id_picture,
    nurse_practicing_cert,
    mobile_number,
    national_id_number,
    ...rest
  }: FormState,
): nurse_registration_details.UpsertableNurseRegistrationDetails {
  return {
    health_worker_id: healthWorker.id,
    face_picture_media_id: face_picture?.id,
    ncz_registration_card_media_id: ncz_registration_card?.id,
    national_id_media_id: national_id_picture?.id,
    nurse_practicing_cert_media_id: nurse_practicing_cert?.id,
    national_id_number: national_id_number.toUpperCase(),
    mobile_number: typeof mobile_number === 'number'
      ? String(mobile_number)
      : mobile_number?.replace(/[^0-9]/g, ''),
    approved_by: null,
    ...rest,
  }
}

export default async function RegisterPage(
  _req: Request,
  ctx: FacilityContext,
) {
  const { healthWorker, organization } = ctx.state
  const { step } = ctx.params

  // TODO: Further make this handling of multistep forms generic
  if (
    !NurseRegistrationStepNames.includes(
      step as unknown as NurseRegistrationStep,
    )
  ) {
    return redirect(`/app/facilities/${organization.id}/register/personal`)
  }

  const registrationFormState = ctx.state.session.get('registrationFormState')

  const formState: Partial<FormState> = registrationFormState
    ? JSON.parse(registrationFormState)
    : {}

  formState.email = healthWorker.email

  const country_address_tree = step == 'personal'
    ? await address.getCountryAddressTree(ctx.state.trx)
    : undefined

  const stepState = useNurseRegistrationSteps(ctx)

  return (
    <Layout
      variant='just logo'
      title='Register as a nurse'
      url={ctx.url}
    >
      <SectionHeader>
        Registration
      </SectionHeader>
      {stepState.stepsTopBar}
      <NurseRegistrationForm
        currentStep={stepState.currentStep}
        formData={formState}
        country_address_tree={country_address_tree}
      />
    </Layout>
  )
}
