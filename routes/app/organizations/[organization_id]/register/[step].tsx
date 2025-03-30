import { assert } from 'std/assert/assert.ts'
import {
  HasStringId,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandlerWithProps,
  Organization,
} from '../../../../../types.ts'
import {
  getNurseRegistrationSteps,
  getStepFormData,
  NurseRegistrationStep,
  NurseRegistrationStepNames,
} from '../../../../../components/health_worker/nurse/invite/Steps.tsx'
import redirect from '../../../../../util/redirect.ts'
import * as employment from '../../../../../db/models/employment.ts'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as nurse_registration_details from '../../../../../db/models/nurse_registration_details.ts'
import {
  DocumentFormFields,
  PersonalFormFields,
  ProfessionalInformationFields,
} from '../../../../../components/health_worker/nurse/invite/Steps.tsx'
import NurseRegistrationForm from '../../../../../islands/nurse-registration-form.tsx'
import compact from '../../../../../util/compact.ts'
import { OrganizationContext } from '../_middleware.ts'
import omit from '../../../../../util/omit.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'

type RegisterPageProps = {
  formState: FormState
}

export type FormState =
  & PersonalFormFields
  & ProfessionalInformationFields
  & DocumentFormFields

export const handler: LoggedInHealthWorkerHandlerWithProps<RegisterPageProps, {
  organization: HasStringId<Organization>
}> = {
  async POST(req, ctx) {
    const employee = await employment.getEmployee(ctx.state.trx, {
      organization_id: ctx.state.organization.id,
      health_worker_id: ctx.state.healthWorker.id,
    })
    assert(employee)

    const { step } = ctx.params

    const priorFormState: Partial<FormState> = await nurse_registration_details
      .getInProgress(
        ctx.state.trx,
        {
          health_worker_id: ctx.state.healthWorker.id,
        },
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
      await nurse_registration_details.setInProgress(
        ctx.state.trx,
        {
          health_worker_id: ctx.state.healthWorker.id,
          data: formState,
        },
      )
      const nextStep = NurseRegistrationStepNames[stepIndex + 1]
      const nextUrl = ctx.url.pathname.replace(`/${step}`, `/${nextStep}`)
      return redirect(nextUrl)
    }

    const { specialty } = formState
    assert(specialty)

    await employment.updateSpecialty(ctx.state.trx, {
      employee_id: employee.id,
      specialty,
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

    await nurse_registration_details.removeInProgress(ctx.state.trx, {
      health_worker_id: ctx.state.healthWorker.id,
    })

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
    ...rest
  }: FormState,
): nurse_registration_details.UpsertableNurseRegistrationDetails {
  return {
    health_worker_id: healthWorker.id,
    face_picture_media_id: face_picture?.id,
    ncz_registration_card_media_id: ncz_registration_card?.id,
    national_id_media_id: national_id_picture?.id,
    nurse_practicing_cert_media_id: nurse_practicing_cert?.id,
    approved_by: null,
    ...rest,
  }
}

export default async function RegisterPage(
  _req: Request,
  ctx: OrganizationContext,
) {
  const { healthWorker, organization } = ctx.state
  const { step } = ctx.params

  // TODO: Further make this handling of multistep forms generic
  if (
    !NurseRegistrationStepNames.includes(
      step as unknown as NurseRegistrationStep,
    )
  ) {
    return redirect(`/app/organizations/${organization.id}/register/personal`)
  }

  const formState: Partial<FormState> = await nurse_registration_details
    .getInProgress(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.healthWorker.id,
      },
    )

  formState.email = healthWorker.email

  const stepState = getNurseRegistrationSteps(ctx)

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
      />
    </Layout>
  )
}
