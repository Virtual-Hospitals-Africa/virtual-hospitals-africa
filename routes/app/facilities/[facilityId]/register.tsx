import {
alterHealthworkerName,
  getInvitee,
  isHealthWorkerWithGoogleTokens,
} from '../../../../db/models/health_workers.ts'
import { HealthWorkerWithGoogleTokens, LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { NurseRegistrationDetails, NurseSpeciality } from '../../../../types.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import {
DocumentFormFields,
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
import {
  addNurseRegistrationDetails,
  addNurseSpeciality,
  getEmployee,
} from '../../../../db/models/health_workers.ts'
import {
  PersonalFormFields,
  ProfessionalInformationFields,
} from '../../../../components/health_worker/nurse/invite/Steps.tsx'
import { HandlerContext } from 'https://deno.land/x/fresh@1.2.0/server.ts'
import { LoggedInHealthWorker } from '../../../../types.ts'


type RegisterPageProps = {
  formState: FormState
}

export type FormState = PersonalFormFields & ProfessionalInformationFields & DocumentFormFields & {
  currentStep: string
  speciality: NurseSpeciality
}

export const handler: LoggedInHealthWorkerHandler<RegisterPageProps> = {
  async GET(req, ctx) {
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))
    const inviteCode = await ctx.state.session.get('inviteCode')
    assert(inviteCode)
    const invite = await getInvitee(ctx.state.trx, {
      inviteCode: inviteCode,
      email: healthWorker.email,
    })
    assert(invite)
    assertEquals(
      facilityId,
      invite.facility_id,
      'facility id in path not equal to invite id in db',
    )

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

    await registerNurse(ctx,formState)

    return redirect('/app')
  },
}

function getNurseRegistrationDetails(healthWorker: HealthWorkerWithGoogleTokens, formState: FormState) : NurseRegistrationDetails {
  return {
    health_worker_id: healthWorker.id,
    gender: formState.gender,
    national_id: formState.national_id,
    date_of_first_practice: formState.date_of_first_practice,
    ncz_registration_number: formState.ncz_registration_number,
    mobile_number: formState.mobile_number,
    face_picture_media_id: undefined,
    ncz_registration_card_media_id: undefined,
    national_id_media_id: undefined,
  }
}

async function registerNurse(ctx: HandlerContext<RegisterPageProps, LoggedInHealthWorker>, formState: FormState) {

  const healthWorker = ctx.state.session.data
  assert(isHealthWorkerWithGoogleTokens(healthWorker))
  const facilityId = parseInt(ctx.params.facilityId)
  const employee = await getEmployee(ctx.state.trx, {
    facilityId: facilityId,
    healthworkerId: healthWorker.id,
  })
  assert(employee)

  const nurseRegistrationDetails = getNurseRegistrationDetails(healthWorker,formState)
  const newName = `${formState.first_name} ${formState.middle_names} ${formState.last_name}`

  await addNurseSpeciality(ctx.state.trx, {
    employeeId: employee.id,
    speciality: formState.speciality,
  })
  
  if (newName !== healthWorker.name) {
    await alterHealthworkerName(ctx.state.trx, {
      healthworkerId: healthWorker.id, newHealthworkerName: newName
    })
  }

  await addNurseRegistrationDetails(ctx.state.trx, {
    registrationDetails: nurseRegistrationDetails,
  })
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
      >
        {stepState.currentStep === 'personal' && <NursePersonalForm />}
        {stepState.currentStep === 'professional' && <NurseProfessionalForm />}
        {stepState.currentStep === 'document' && <NurseDocumentForm />}
      </form>
    </Container>
  )
}
