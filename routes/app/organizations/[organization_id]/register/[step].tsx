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
import * as nurse_registration_details from '../../../../../db/models/nurse_registration_details.ts'
import {
  DocumentFormFields,
  PersonalFormFields,
  ProfessionalInformationFields,
} from '../../../../../components/health_worker/nurse/invite/Steps.tsx'
import NurseRegistrationForm from '../../../../../islands/nurse-registration-form.tsx'
import { OrganizationContext } from '../_middleware.ts'
import omit from '../../../../../util/omit.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'

type RegisterPageProps = {
  form_state: FormState
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
      health_worker_id: ctx.state.health_worker.id,
    })
    assert(employee)

    const { step } = ctx.params

    const prior_form_state: Partial<FormState> =
      await nurse_registration_details
        .getInProgress(
          ctx.state.trx,
          {
            health_worker_id: ctx.state.health_worker.id,
          },
        )

    const new_form_state = await getStepFormData(
      step,
      ctx.state.trx,
      req,
    )

    const form_state = {
      ...prior_form_state,
      ...new_form_state,
    }

    const stepIndex = NurseRegistrationStepNames.findIndex((name) =>
      name === step
    )

    if (stepIndex < NurseRegistrationStepNames.length - 1) {
      await nurse_registration_details.setInProgress(
        ctx.state.trx,
        {
          health_worker_id: ctx.state.health_worker.id,
          data: form_state,
        },
      )
      const next_step = NurseRegistrationStepNames[stepIndex + 1]
      const next_url = ctx.url.pathname.replace(`/${step}`, `/${next_step}`)
      return redirect(next_url)
    }

    const { specialty } = form_state
    assert(specialty)

    await employment.updateSpecialty(ctx.state.trx, {
      employee_id: employee.id,
      specialty,
    })

    const registration_details = getRegistrationDetails(
      ctx.state.health_worker,
      omit(form_state, [
        'specialty',
      ]) as FormState,
    )

    await nurse_registration_details.add(ctx.state.trx, registration_details)

    await nurse_registration_details.removeInProgress(ctx.state.trx, {
      health_worker_id: ctx.state.health_worker.id,
    })

    return redirect('/app')
  },
}

function getRegistrationDetails(
  health_worker: HealthWorkerWithGoogleTokens,
  {
    face_picture,
    ncz_registration_card,
    national_id_picture,
    nurse_practicing_cert,
    ...rest
  }: FormState,
): nurse_registration_details.UpsertableNurseRegistrationDetails {
  return {
    health_worker_id: health_worker.id,
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
  const { health_worker, organization } = ctx.state
  const { step } = ctx.params

  // TODO: Further make this handling of multistep forms generic
  if (
    !NurseRegistrationStepNames.includes(
      step as unknown as NurseRegistrationStep,
    )
  ) {
    return redirect(`/app/organizations/${organization.id}/register/personal`)
  }

  const form_state: Partial<FormState> = await nurse_registration_details
    .getInProgress(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.health_worker.id,
      },
    )

  form_state.email = health_worker.email

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
        form_data={form_state}
      />
    </Layout>
  )
}
