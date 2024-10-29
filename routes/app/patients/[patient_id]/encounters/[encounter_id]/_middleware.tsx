import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  LoggedInHealthWorkerHandler,
  Maybe,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  Sendable,
  SendToFormSubmission,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as send_to from '../../../../../../db/models/send_to.ts'
import * as organizations from '../../../../../../db/models/organizations.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { Person } from '../../../../../../components/library/Person.tsx'
import { StepsSidebar } from '../../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../../util/capitalize.ts'
import { ENCOUNTER_STEPS } from '../../../../../../shared/encounter.ts'
import {
  completedStep,
  removeFromWaitingRoomAndAddSelfAsProvider,
} from '../../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'
import { assertOr400, assertOr404 } from '../../../../../../util/assertOr.ts'
import { ButtonsContainer } from '../../../../../../islands/form/buttons.tsx'
import { SendToButton } from '../../../../../../islands/SendTo/Button.tsx'
import { Button } from '../../../../../../components/library/Button.tsx'
import { EncounterStep } from '../../../../../../db.d.ts'
import { groupByMapped } from '../../../../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import words from '../../../../../../util/words.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'

export function getEncounterId(ctx: FreshContext): 'open' | string {
  if (ctx.params.encounter_id === 'open') {
    return 'open'
  }
  return getRequiredUUIDParam(ctx, 'encounter_id')
}

type EncounterPageProps = {
  patient: patients.PatientCard
  encounter: RenderedPatientEncounter
  encounter_provider: RenderedPatientEncounterProvider
}

export type EncounterContext = LoggedInHealthWorkerContext<
  EncounterPageProps
>

export async function completeStep(ctx: EncounterContext) {
  const step = nav_links.find((link) => link.route === ctx.route)?.step
  assert(step)
  await completedStep(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    step,
  })
  return redirect(nextLink(ctx))
}

export function postHandler<T>(
  assertion: (
    form_values: unknown,
  ) => asserts form_values is T,
  handleForm: (
    ctx: EncounterContext,
    form_values: T,
  ) => Promise<void>,
): LoggedInHealthWorkerHandler<EncounterContext> {
  function assertSendToAnd(
    form_values: unknown,
  ): asserts form_values is T & {
    send_to?: Maybe<SendToFormSubmission>
  } {
    assertOr400(isObjectLike(form_values))
    if (form_values.send_to) send_to.SendToSchema.parse(form_values.send_to)
    assertion(form_values)
  }

  return {
    async POST(req, ctx) {
      const form_values = await parseRequestAsserts(
        ctx.state.trx,
        req,
        assertSendToAnd,
      )
      await handleForm(ctx, form_values)
      const response = await completeStep(ctx)
      if (form_values.send_to) {
        throw new Error('TODO: implement send to')
      }
      return response
    },
  }
}

export async function handler(
  _req: Request,
  ctx: EncounterContext,
) {
  const encounter_id = getEncounterId(ctx)
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const getting_patient_card = patients.getCard(ctx.state.trx, {
    id: patient_id,
  })
  Object.assign(
    ctx.state,
    await removeFromWaitingRoomAndAddSelfAsProvider(
      ctx.state.trx,
      {
        encounter_id,
        patient_id,
        health_worker: ctx.state.healthWorker,
      },
    ),
  )
  const patient = await getting_patient_card
  assertOr404(patient, 'Patient not found')
  ctx.state.patient = patient
  return ctx.next()
}

const nav_links = ENCOUNTER_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/encounters/:encounter_id/${step}`,
}))

const buttonText = (step: string) => words(step).map(capitalize).join(' ')

const next_links_by_route = groupByMapped(
  nav_links,
  (link) => link.route,
  (link, i) => {
    const next_link = nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, nav_links.length - 1)
      assertEquals(link.step, 'close_visit')
    }
    return {
      route: next_link?.route ||
        `/app/patients/:patient_id/encounters/open/vitals`,
      button_text: next_link
        ? `Continue to ${buttonText(next_link.step)}`
        : 'Conclude visit',
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

export function EncounterLayout({
  ctx,
  sendables,
  next_step_text,
  children,
}: {
  ctx: EncounterContext
  sendables: Sendable[]
  next_step_text?: string
  children: ComponentChildren
}): JSX.Element {
  return (
    <Layout
      title={capitalize(ctx.state.encounter.reason)}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links}
          top={{
            href: replaceParams('/app/patients/:patient_id', ctx.params),
            child: <Person person={ctx.state.patient} />,
          }}
          steps_completed={ctx.state.encounter.steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Form method='POST' id='encounter'>
        {children}
        <hr />
        <ButtonsContainer>
          <SendToButton
            form='encounter'
            patient={{
              name: ctx.state.patient.name,
              description: ctx.state.patient.description,
              avatar_url: ctx.state.patient.avatar_url,
              actions: {
                clinical_notes: replaceParams(
                  '/app/patients/:patient_id/encounter/open/clinical_notes',
                  ctx.params,
                ),
              },
            }}
            sendables={sendables}
          />
          <Button
            type='submit'
            className='flex-1 max-w-xl'
          >
            {next_step_text || nextStep(ctx).button_text}
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

export type EncounterPageChildProps = EncounterPageProps & {
  ctx: EncounterContext
  previously_completed: boolean
}

export function EncounterPage(
  render: (
    props: EncounterPageChildProps,
  ) =>
    | JSX.Element
    | Promise<JSX.Element>
    | Promise<{ next_step_text: string; children: JSX.Element }>,
) {
  return async function (
    _req: Request,
    ctx: EncounterContext,
  ) {
    const { healthWorker, patient, encounter, encounter_provider, trx } =
      ctx.state
    const step = ctx.route.split('/').pop()!
    const previously_completed = encounter.steps_completed.includes(
      step as unknown as EncounterStep,
    )

    const { organization_id } = encounter_provider
    const { location } = await organizations.getById(
      trx,
      organization_id,
    )

    const { rendered, sendables } = await promiseProps({
      rendered: Promise.resolve(
        render({ ctx, ...ctx.state, previously_completed }),
      ),
      sendables: send_to.forPatientEncounter(
        trx,
        patient.id,
        location,
        organization_id,
        {
          exclude_health_worker_id: healthWorker.id,
        },
      ),
    })

    let next_step_text: string | undefined
    let children = rendered
    if ('next_step_text' in rendered) {
      next_step_text = rendered.next_step_text as string
      children = rendered.children
    }

    return (
      <EncounterLayout
        ctx={ctx}
        next_step_text={next_step_text}
        sendables={sendables}
      >
        {children}
      </EncounterLayout>
    )
  }
}
