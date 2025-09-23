import { ComponentChildren, JSX } from 'preact'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../../components/library/Form.tsx'
import {
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
} from '../../../../../../../types.ts'
import * as patient_encounters from '../../../../../../../db/models/patient_encounters.ts'

import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../../../components/library/Sidebar.tsx'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { ButtonsContainer } from '../../../../../../../islands/form/buttons.tsx'
import { Button } from '../../../../../../../components/library/Button.tsx'
import {
  assertOr403,
  assertOr404,
  assertOrRedirect,
} from '../../../../../../../util/assertOr.ts'
import last from '../../../../../../../util/last.ts'
import {
  isPatientTriageStep,
  PATIENT_TRIAGE_STEPS,
  PatientTriageStep,
} from '../../../../../../../shared/patient_triage.ts'
import { groupByMapped } from '../../../../../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

import { OrganizationContext } from '../../../_middleware.ts'

type PatientTriagePageProps = {
  step: PatientTriageStep
  steps_completed: PatientTriageStep[]
  encounter: RenderedPatientEncounter
  encounter_provider: RenderedPatientEncounterProvider
}

export type PatientTriageContext = OrganizationContext & {
  state: PatientTriagePageProps
}

const nav_links = PATIENT_TRIAGE_STEPS.map((step) => ({
  step,
  route:
    `/app/organizations/:organization_id/patients/:patient_id/triage/${step}`,
}))

const next_links_by_step = groupByMapped(
  nav_links,
  (link) => link.step,
  (link, i) => {
    const next_link = nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, nav_links.length - 1)
      assertEquals(link.step, 'confirm_triage_level')
    }
    return {
      route: next_link?.route ||
        `/app/organizations/:organization_id/waiting_room?just_encountered_patient_id=:patient_id`,
      button_text: next_link ? `Next` : 'End and Save Triage',
    }
  },
)

const nextStep = (
  { state: { step } }: PatientTriageContext,
) => {
  const next_link = next_links_by_step.get(step)
  assert(next_link, `No next link for step ${step}`)
  return next_link
}

const nextLink = (ctx: PatientTriageContext) =>
  replaceParams(nextStep(ctx).route, ctx.params)

function assertProvider(ctx: PatientTriageContext): string {
  const { provider_id } = ctx.state.organization_employment
  assert(
    provider_id,
    'Only providers can triage patients',
  )
  return provider_id
}

export function completeStep(
  ctx: PatientTriageContext,
) {
  const step = nav_links.find((link) => ctx.route.startsWith(link.route))?.step
  assert(step)
  return redirect(nextLink(ctx))
}

function stepFromUrl(ctx: PatientTriageContext): PatientTriageStep {
  const step = last(ctx.route.split('/'))
  assertOrRedirect(
    isPatientTriageStep(step),
    replaceParams(
      '/app/organizations/:organization_id/patients/:patient_id/triage/chief_complaint',
      ctx.params,
    ),
  )
  return step
}

export async function handler(
  _req: Request,
  ctx: PatientTriageContext,
) {
  if (ctx.route.endsWith('/triage')) {
    return redirect(replaceParams(
      '/app/organizations/:organization_id/patients/:patient_id/triage/chief_complaint',
      ctx.params,
    ))
  }
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const step = stepFromUrl(ctx)

  const { trx } = ctx.state

  const encounter = await patient_encounters.getOpen(trx, patient_id)
  assertOr404(encounter)

  const employed_at_encounter_organization = encounter.organization_id ===
    ctx.state.organization_employment.organization.id
  assertOr403(employed_at_encounter_organization)

  const encounter_provider = encounter.providers.find((provider) =>
    provider.health_worker_id === ctx.state.health_worker.id &&
    provider.organization_id === ctx.state.organization.id
  )
  assertOr403(encounter_provider, 'Must POST to /start-triage first')

  const steps_completed: PatientTriageStep[] = []

  const patient_triage_props: PatientTriagePageProps = {
    step,
    steps_completed,
    encounter,
    encounter_provider,
  }

  Object.assign(ctx.state, patient_triage_props)
  return ctx.next()
}

export function PatientTriageLayout({
  ctx,
  next_step_text,
  children,
}: {
  ctx: PatientTriageContext
  next_step_text?: string
  children: ComponentChildren
}): JSX.Element {
  return (
    <Layout
      title='Patient Triage'
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links}
          steps_completed={ctx.state.steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Form method='POST' id={`triage-${ctx.state.step}`}>
        {children}
        <hr />
        <ButtonsContainer>
          <Button
            type='submit'
            className='flex-1 max-w-xl'
          >
            {next_step_text || 'Next'}
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

export type PatientTriagePageChildProps = PatientTriagePageProps & {
  ctx: PatientTriageContext
  previously_completed: boolean
}

export function PatientTriagePage<
  Context extends PatientTriageContext = PatientTriageContext,
>(
  render: (
    ctx: Context,
  ) =>
    | JSX.Element
    | Promise<JSX.Element>
    | Promise<{ next_step_text: string; children: JSX.Element }>
    | Promise<Response>
    | Promise<Response | JSX.Element>,
) {
  return async function (
    _req: Request,
    ctx: PatientTriageContext,
  ) {
    assert(ctx.state.organization.location, 'Location not found')
    assertProvider(ctx)

    const rendered = await render(ctx as Context)

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
      <PatientTriageLayout
        ctx={ctx}
        next_step_text={next_step_text}
      >
        {children}
      </PatientTriageLayout>
    )
  }
}
