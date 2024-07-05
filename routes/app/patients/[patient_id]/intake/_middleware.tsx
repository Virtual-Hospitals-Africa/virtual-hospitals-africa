import { ComponentChildren, JSX } from 'preact'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  PatientIntake,
  Sendable,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { assertOr404, assertOrRedirect } from '../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../components/library/Sidebar.tsx'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'
import { INTAKE_STEPS, isIntakeStep } from '../../../../../shared/intake.ts'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../../../../db/models/patient_encounters.ts'
import * as send_to from '../../../../../db/models/send_to.ts'
import Buttons, {
  ButtonsContainer,
} from '../../../../../islands/form/buttons.tsx'
import { SendToButton } from '../../../../../islands/SendTo/Button.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { groupByMapped } from '../../../../../util/groupBy.ts'
import { IntakeStep } from '../../../../../db.d.ts'

export type IntakePagePatient = {
  is_review: false
  data: PatientIntake
} | {
  is_review: true
  data: Awaited<ReturnType<typeof patients.getIntakeReviewById>>
}

export type IntakeContext = LoggedInHealthWorkerContext<
  { patient: IntakePagePatient }
>

export async function handler(
  _req: Request,
  ctx: IntakeContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const is_review = ctx.route.endsWith(`/review`)

  // TODO: use the encounter as part of intake?
  await removeFromWaitingRoomAndAddSelfAsProvider(ctx.state.trx, {
    patient_id,
    encounter_id: 'open',
    health_worker: ctx.state.healthWorker,
  })

  const patient: IntakePagePatient = is_review
    ? {
      is_review: true as const,
      data: await patients.getIntakeReviewById(ctx.state.trx, patient_id),
    }
    : {
      is_review: false as const,
      data: await patients.getIntakeById(ctx.state.trx, patient_id),
    }

  ctx.state.patient = patient
  return ctx.next()
}

const intake_nav_links = INTAKE_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/intake/${step}`,
}))

const next_links_by_route = groupByMapped(
  intake_nav_links,
  (link) => link.route,
  (link, i) => {
    const next_link = intake_nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, intake_nav_links.length - 1)
      assertEquals(link.step, 'review')
    }
    return {
      route: next_link?.route ||
        `/app/patients/:patient_id/encounters/open/vitals`,
      button_text: next_link ? `Continue to ${next_link.step}` : 'Start visit',
    }
  },
)

const nextStep = ({ route }: FreshContext) => {
  const next_link = next_links_by_route.get(route)
  assert(next_link, `No next link for route ${route}`)
  return next_link
}

const nextLink = (ctx: FreshContext) =>
  replaceParams(nextStep(ctx).route, ctx.params)

export async function upsertPatientAndRedirect(
  ctx: IntakeContext,
  patient: Omit<patients.UpsertPatientIntake, 'id' | 'intake_steps_completed'>,
) {
  const step = ctx.route.split('/').pop()
  assert(step)
  assert(isIntakeStep(step))

  await patients.upsertIntake(ctx.state.trx, {
    ...patient,
    id: ctx.state.patient.data.id,
    completed_intake: patient.completed_intake || (step === 'review'),
    intake_step_just_completed: step,
  })

  return redirect(nextLink(ctx))
}

export function assertAgeYearsKnown(ctx: IntakeContext): number {
  const { patient } = ctx.state
  const age_years = patient.data.age?.age_years
  const warning = encodeURIComponent(
    "Please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    age_years != null,
    `/app/patients/${patient.data.id}/intake/personal?warning=${warning}`,
  )
  return age_years
}

export function IntakeLayout({
  ctx,
  sendables,
  children,
}: {
  ctx: IntakeContext
  sendables: Sendable[]
  children: ComponentChildren
}): JSX.Element {
  return (
    <Layout
      title='Patient Intake'
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={intake_nav_links}
          steps_completed={ctx.state.patient.data.intake_steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Form id='intake' method='POST'>
        {children}
        <hr className='my-2' />

        <ButtonsContainer>
          <SendToButton sendables={sendables} />
          <Buttons
            submitText={nextStep(ctx).button_text}
            className='flex-1 max-w-xl '
          />
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

type IntakePageChildProps = {
  ctx: IntakeContext
  patient: IntakePagePatient
  previously_completed: boolean
}

export function IntakePage(
  render: (props: IntakePageChildProps) => JSX.Element | Promise<JSX.Element>,
) {
  return async function (
    _req: Request,
    ctx: IntakeContext,
  ) {
    const { patient } = ctx.state
    const step = ctx.route.split('/').pop()!
    const previously_completed = patient.data.intake_steps_completed.includes(
      step as unknown as IntakeStep,
    )
    const getting_sendables = send_to.forPatient(ctx.state.trx, patient.data.id)

    const children = await render({ ctx, patient, previously_completed })

    return (
      <IntakeLayout ctx={ctx} sendables={await getting_sendables}>
        {children}
      </IntakeLayout>
    )
  }
}
