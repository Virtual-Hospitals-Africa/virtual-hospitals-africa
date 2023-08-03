import { HealthWorkerWithGoogleTokens, LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { NurseRegistrationDetails, NurseSpeciality } from '../../../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import {
  getStepFormData,
  isNurseRegistrationStep,
  NurseRegistrationStepNames,
  useNurseRegistrationSteps,
} from '../../../../components/health_worker/nurse/invite/Steps.tsx'
import redirect from '../../../../util/redirect.ts'
import { PageProps } from 'https://deno.land/x/fresh@1.2.0/server.ts'
import { Container } from '../../../../components/library/Container.tsx'
import NursePersonalForm from '../../../../components/health_worker/nurse/invite/NursePersonalForm.tsx'
import NurseProfessionalForm from '../../../../components/health_worker/nurse/invite/NurseProfessionalForm.tsx'
import NurseDocumentForm from '../../../../components/health_worker/nurse/invite/NurseDocumentForm.tsx'
import * as health_workers from '../../../../db/models/health_workers.ts'
import * as employment from '../../../../db/models/employment.ts'
import * as nurse_specialties from '../../../../db/models/nurse_specialties.ts'
import * as nurse_registration_details from '../../../../db/models/nurse_registration_details.ts'
import {
  PersonalFormFields,
  ProfessionalInformationFields,
  DocumentFormFields
} from '../../../../components/health_worker/nurse/invite/Steps.tsx'

type RegisterPageProps = {
  formState: FormState
}

export type FormState = PersonalFormFields & ProfessionalInformationFields & DocumentFormFields & {
  currentStep: string
  speciality: NurseSpeciality
}

export const handler: LoggedInHealthWorkerHandler<RegisterPageProps> = {
  GET(req, ctx) {
    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)
    const healthWorker = ctx.state.session.data
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))

    const url = new URL(req.url)
    const stepParam = url.searchParams.get('step')

    const formObject = ctx.state.session.get('inviteFormState')
    let formState: FormState
    const currentStep = isNurseRegistrationStep(stepParam)
      ? stepParam
      : NurseRegistrationStepNames[0]
    formObject
      ? formState = JSON.parse(formObject)
      : formState = {} as FormState
    formState.currentStep = currentStep
    assert(formState)
    ctx.state.session.set('inviteFormState', JSON.stringify(formState))

    return ctx.render({ formState })
  },
  async POST(req, ctx) {
    const formState: FormState = JSON.parse(
      ctx.state.session.get('inviteFormState'),
    )
    const nurseData = await getStepFormData(
      formState.currentStep,
      ctx.state.trx,
      req,
    )
    Object.assign(formState, nurseData)
    const stepIndex = NurseRegistrationStepNames.findIndex((name) =>
      name === formState.currentStep
    )

    if (stepIndex < NurseRegistrationStepNames.length - 1) {
      ctx.state.session.set('inviteFormState', JSON.stringify(formState))
      const nextStep = NurseRegistrationStepNames[stepIndex + 1]
      const nextPage = new URL(req.url)
      nextPage.searchParams.set('step', nextStep)
      return redirect(nextPage.toString())
    }

    const healthWorker = ctx.state.session.data
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const facility_id = parseInt(ctx.params.facility_id)
    const employee = await employment.getEmployee(ctx.state.trx, {
      facility_id: facility_id,
      health_worker_id: healthWorker.id,
    })
    assert(employee)

    const nurseRegistrationDetails = getRegistrationDetails(healthWorker,formState)

    await nurse_specialties.add(ctx.state.trx, {
      employee_id: employee.id,
      speciality: formState.speciality,
    })

    await nurse_registration_details.add(ctx.state.trx, {
      registrationDetails: nurseRegistrationDetails,
    })

    return redirect('/app')
  },
}

function getRegistrationDetails(healthWorker: HealthWorkerWithGoogleTokens, formState: FormState): NurseRegistrationDetails {
  return {
    health_worker_id: healthWorker.id,
    gender: formState.gender,
    national_id: formState.national_id,
    date_of_first_practice: formState.date_of_first_practice,
    ncz_registration_number: formState.ncz_registration_number,
    mobile_number: formState.mobile_number,
    face_picture_media_id: formState.face_picture?.id,
    ncz_registration_card_media_id: formState.ncz_registration_card?.id,
    national_id_media_id: formState.national_id_picture?.id,
  }
}

export default function register(
  props: PageProps<RegisterPageProps>,
) {
  const stepState = useNurseRegistrationSteps(props)

  return (
    <Container size='lg'>
      {stepState.stepsTopBar}
      <form
        method='POST'
        className='w-full mt-4'
        encType='multipart/form-data'
      >
        {stepState.currentStep === 'personal' && <NursePersonalForm />}
        {stepState.currentStep === 'professional' && <NurseProfessionalForm />}
        {stepState.currentStep === 'document' && <NurseDocumentForm />}
      </form>
    </Container>
  )
}
