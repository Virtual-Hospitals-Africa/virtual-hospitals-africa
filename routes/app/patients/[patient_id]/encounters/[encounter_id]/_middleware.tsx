import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  LoggedInHealthWorkerHandler,
  Maybe,
  Measurements,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  type RenderedPatientExaminationFinding,
  Sendable,
  SendToFormSubmission,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as send_to from '../../../../../../db/models/send_to.ts'
import * as findings from '../../../../../../db/models/findings.ts'
import * as organizations from '../../../../../../db/models/organizations.ts'
import * as patient_measurements from '../../../../../../db/models/patient_measurements.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
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
import { PatientDrawer } from '../../../../../../islands/patient-drawer/Drawer.tsx'

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
  req: Request,
  ctx: EncounterContext,
) {
  const encounter_id = getEncounterId(ctx)

  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const { patient, encounter: { encounter, encounter_provider } } =
    await promiseProps({
      patient: patients.getCard(ctx.state.trx, {
        id: patient_id,
      }),
      encounter: removeFromWaitingRoomAndAddSelfAsProvider(
        ctx.state.trx,
        {
          encounter_id,
          patient_id,
          health_worker: ctx.state.healthWorker,
        },
      ),
    })

  assertOr404(patient, 'Patient not found')

  if (encounter_id === 'open' && req.method === 'GET') {
    return redirect(
      replaceParams(
        ctx.route,
        {
          ...ctx.params,
          encounter_id: encounter.encounter_id,
        },
      ),
    )
  }
  ctx.state.patient = patient
  ctx.state.encounter = encounter
  ctx.state.encounter_provider = encounter_provider
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
  key_findings,
  next_step_text,
  children,
  measurements,
}: {
  ctx: EncounterContext
  sendables: Sendable[]
  key_findings: RenderedPatientExaminationFinding[]
  next_step_text?: string
  children: ComponentChildren
  measurements: Partial<Measurements>
}): JSX.Element {
  console.log('measurements in EncounterLayout', measurements)
  return (
    <Layout
      title={capitalize(ctx.state.encounter.reason)}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links}
          steps_completed={ctx.state.encounter.steps_completed}
        />
      }
      drawer={
        <PatientDrawer
          patient={ctx.state.patient}
          encounter={ctx.state.encounter}
          findings={key_findings}
          sendables={sendables}
          measurements={measurements}
          flaggedVitals={{}}
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
            patient={ctx.state.patient}
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
    | Promise<{ next_step_text: string; children: JSX.Element }>
    | Promise<Response>,
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

    assert(location, 'Location not found')

    const { rendered, sendables, key_findings, measurements } =
      await promiseProps({
        rendered: Promise.resolve(
          render({ ctx, ...ctx.state, previously_completed }),
        ),
        sendables: send_to.forPatientEncounter(
          trx,
          patient.id,
          location,
          encounter.providers,
          {
            exclude_health_worker_id: healthWorker.id,
            primary_doctor_id: ctx.state.patient.primary_doctor_id ?? undefined,
          },
        ),
        key_findings: findings.forPatientEncounter(trx, {
          patient_id: patient.id,
          encounter_id: encounter.encounter_id,
        }),
        measurements: patient_measurements.getEncounterVitals(trx, {
          patient_id: patient.id,
          encounter_id: encounter.encounter_id,
        }),
      })

    if (rendered instanceof Response) {
      return rendered
    }

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
        key_findings={key_findings}
        measurements={measurements}
      >
        {children}
      </EncounterLayout>
    )
  }
}
