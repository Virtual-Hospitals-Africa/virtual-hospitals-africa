import { ComponentChildren, JSX } from 'preact'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  LoggedInHealthWorkerHandler,
  Maybe,
  PatientIntake,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  Sendable,
  SendToFormSubmission,
} from '../../../../../types.ts'
import * as patient_intake from '../../../../../db/models/patient_intake.ts'
import * as employment from '../../../../../db/models/employment.ts'
import * as organizations from '../../../../../db/models/organizations.ts'
import { assertOr400, assertOrRedirect } from '../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'
import { INTAKE_STEPS, isIntakeStep } from '../../../../../shared/intake.ts'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../../../../db/models/patient_encounters.ts'
import * as send_to from '../../../../../db/models/send_to.ts'
import * as waiting_room from '../../../../../db/models/waiting_room.ts'
import * as patient_encounters from '../../../../../db/models/patient_encounters.ts'
import { ButtonsContainer } from '../../../../../islands/form/buttons.tsx'
import { SendToButton } from '../../../../../islands/SendTo/Button.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { groupByMapped } from '../../../../../util/groupBy.ts'
import { IntakeStep } from '../../../../../db.d.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import {
  parseRequest,
  parseRequestAsserts,
} from '../../../../../util/parseForm.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import capitalize from '../../../../../util/capitalize.ts'
import { promiseProps } from '../../../../../util/promiseProps.ts'

export type IntakeContext = LoggedInHealthWorkerContext<
  {
    patient: PatientIntake
    encounter: RenderedPatientEncounter
    encounter_provider: RenderedPatientEncounterProvider
  }
>

export async function handler(
  _req: Request,
  ctx: IntakeContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  // TODO: use the encounter as part of intake?
  const { encounter, encounter_provider } =
    await removeFromWaitingRoomAndAddSelfAsProvider(ctx.state.trx, {
      patient_id,
      encounter_id: 'open',
      health_worker: ctx.state.healthWorker,
    })

  ctx.state.patient = await patient_intake.getById(ctx.state.trx, patient_id)
  ctx.state.encounter = encounter
  ctx.state.encounter_provider = encounter_provider
  return ctx.next()
}

const nav_links = INTAKE_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/intake/${step}`,
}))

const next_links_by_route = groupByMapped(
  nav_links,
  (link) => link.route,
  (_, i) => {
    const next_link = nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, nav_links.length - 1)
      // assertEquals(link.step, 'summary')
    }
    return {
      route: next_link?.route ||
        `/app/patients/:patient_id/encounters/open/vitals`,
      button_text: next_link
        ? `Continue to ${capitalize(next_link.step)}`
        : 'Complete Intake',
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

async function sendTo(
  ctx: IntakeContext,
  send_to: SendToFormSubmission,
  step: string,
) {
  const { encounter_provider, encounter, trx } = ctx.state
  if (send_to.action && send_to.action === 'waiting_room') {
    const { organization_id } = encounter_provider
    const patient_encounter_id = encounter.encounter_id

    await waiting_room.add(
      trx,
      { organization_id, patient_encounter_id },
    )
    const just_completed = step === 'summary' ? 'Intake' : capitalize(step)

    const success = encodeURIComponent(
      `${just_completed} completed and patient added to the waiting room.`,
    )
    return redirect(
      `/app/organizations/${organization_id}/waiting_room?success=${success}`,
    )
  }

  if (send_to.entity) {
    const { organization_id } = encounter_provider
    const { encounter_id } = encounter

    const provider_id = send_to.entity.id

    await patient_encounters.addProvider(
      trx,
      {
        encounter_id,
        provider_id,
      },
    )

    await waiting_room.add(
      trx,
      { organization_id, patient_encounter_id: encounter_id },
    )

    const employee_name = await employment.getName(trx, {
      employment_id: provider_id,
    })
    const success = encodeURIComponent(
      `${capitalize(step)} completed and patient sent to ${employee_name}.`,
    )
    return redirect(
      `/app/organizations/${organization_id}/waiting_room?success=${success}`,
    )
  }

  throw new Error('TODO: implement send_to')
}

async function upsertPatientAndRedirect(
  ctx: IntakeContext,
  send_to: Maybe<SendToFormSubmission>,
  update_patient: () => Promise<void>,
) {
  const step = ctx.route.split('/').pop()
  assert(step)
  assert(isIntakeStep(step))

  await update_patient()

  await patient_intake.updateCompletion(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    completed_intake: ctx.state.patient.completed_intake, // ctx.state.patient.completed_intake || (step === 'summary'),
    intake_step_just_completed: step,
  })

  return send_to ? sendTo(ctx, send_to, step) : redirect(nextLink(ctx))
}

export function assertAgeYearsKnown(ctx: IntakeContext): number {
  const { patient } = ctx.state
  const age_years = patient.age?.age_years
  const warning = encodeURIComponent(
    "Some questions are age-dependent, so please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    age_years != null,
    `/app/patients/${patient.id}/intake/personal?warning=${warning}`,
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
      // sidebar={
      //   <StepsSidebar
      //     ctx={ctx}
      //     nav_links={nav_links}
      //     steps_completed={ctx.state.patient.intake_steps_completed}
      //   />
      // }
      url={ctx.url}
      variant='just logo'
    >
      <Form id='intake' method='POST'>
        {children}
        <hr className='my-2' />

        <ButtonsContainer>
          <SendToButton
            form='intake'
            patient={ctx.state.patient}
            sendables={sendables}
          />
          <Button
            type='submit'
            className='flex-1 max-w-xl'
          >
            {nextStep(ctx).button_text}
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

type IntakePageChildProps = {
  ctx: IntakeContext
  patient: PatientIntake
  previously_completed: boolean
}

export function IntakePage(
  render: (props: IntakePageChildProps) => JSX.Element | Promise<JSX.Element>,
) {
  return async function (
    _req: Request,
    ctx: IntakeContext,
  ) {
    const { healthWorker, patient, encounter, encounter_provider, trx } =
      ctx.state
    const step = ctx.route.split('/').pop()!
    const previously_completed = patient.intake_steps_completed.includes(
      step as unknown as IntakeStep,
    )

    const { location } = await organizations.getById(
      trx,
      encounter_provider.organization_id,
    )

    const { rendered, sendables } = await promiseProps({
      rendered: render({ ctx, patient, previously_completed }),
      sendables: send_to.forPatientIntake(
        trx,
        patient.id,
        location,
        encounter_provider.organization_id,
        encounter.providers,
        {
          exclude_health_worker_id: healthWorker.id,
          primary_doctor_id: ctx.state.patient.primary_doctor_id ?? undefined,
        },
      ),
    })

    return (
      <IntakeLayout ctx={ctx} sendables={sendables}>
        {rendered}
      </IntakeLayout>
    )
  }
}

function assertIsSendTo(
  send_to: unknown,
): asserts send_to is Maybe<SendToFormSubmission> {
  if (!send_to) return
  assertOr400(isObjectLike(send_to))
  if (send_to.action) {
    assertOr400(
      typeof send_to.action === 'string',
      'send_to.action must be a string',
    )
    assertOr400(
      !send_to.entity,
      'send_to.entity must not be present when send_to.action is present',
    )
  }
  if (send_to.entity) {
    assertOr400(isObjectLike(send_to.entity))
    assertOr400(
      typeof send_to.entity.id === 'string',
      'send_to.entity.id must be a string',
    )
    assertOr400(
      typeof send_to.entity.type === 'string',
      'send_to.entity.type must be a string',
    )
    assertOr400(
      !send_to.action,
      'send_to.action must not be present when send_to.entity is present',
    )
  }
}

/* @deprecated */
export function postHandlerAsserts<PostBody>(
  assertion: (
    form_values: unknown,
  ) => asserts form_values is PostBody,
  updatePatient: (
    ctx: IntakeContext,
    patient_id: string,
    patient_updates: PostBody,
  ) => Promise<void>,
): LoggedInHealthWorkerHandler<IntakeContext> {
  function assertSendToAndPatientIntake(
    form_values: unknown,
  ): asserts form_values is PostBody & {
    send_to?: Maybe<SendToFormSubmission>
  } {
    assertOr400(isObjectLike(form_values))
    assertIsSendTo(form_values.send_to)
    assertion(form_values)
  }

  return {
    async POST(req, ctx) {
      const { send_to, ...patient } = await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertSendToAndPatientIntake,
      )
      return upsertPatientAndRedirect(
        ctx,
        send_to,
        () => updatePatient(ctx, ctx.state.patient.id, patient as PostBody),
      )
    },
  }
}

export function postHandler<PostBody>(
  parse: (form_values: unknown) => PostBody,
  updatePatient: (
    ctx: IntakeContext,
    patient_id: string,
    patient_updates: PostBody,
  ) => Promise<void>,
): LoggedInHealthWorkerHandler<IntakeContext> {
  function parseSendToAndPatientIntake(
    form_values: unknown,
  ): PostBody & {
    send_to?: Maybe<SendToFormSubmission>
  } {
    assertOr400(isObjectLike(form_values))
    assertIsSendTo(form_values.send_to)
    const values = parse(form_values)
    return {
      ...values,
      send_to: form_values.send_to,
    }
  }

  return {
    async POST(req, ctx) {
      const { send_to, ...patient } = await parseRequest(
        ctx.state.trx,
        req,
        parseSendToAndPatientIntake,
      )
      return upsertPatientAndRedirect(
        ctx,
        send_to,
        () => updatePatient(ctx, ctx.state.patient.id, patient as PostBody),
      )
    },
  }
}
