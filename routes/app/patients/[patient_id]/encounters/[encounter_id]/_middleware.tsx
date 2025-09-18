import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../components/library/Form.tsx'
import {
  HasStringId,
  LoggedInHealthWorkerContext,
  PatientWithOpenEncounter,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  RenderedPatientHistory,
  ThisVisitRecords,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import { get as getThisVisitRecords } from '../../../../../../db/models/this_visit_records.ts'
import { get as getPatientHistory } from '../../../../../../db/models/patient_history.ts'

import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../../util/capitalize.ts'
import {
  ENCOUNTER_STEPS,
  isEncounterStep,
} from '../../../../../../shared/encounter.ts'
import {
  completedStep,
  removeFromWaitingRoomAndAddSelfAsProvider,
} from '../../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'
import { ButtonsContainer } from '../../../../../../islands/form/buttons.tsx'
import { Button } from '../../../../../../components/library/Button.tsx'
import { EncounterStep } from '../../../../../../db.d.ts'
import { groupByMapped } from '../../../../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'

import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import PatientDrawerV3 from '../../../../../../islands/patient-drawer-v3/DrawerV3.tsx'

export function getEncounterId(ctx: FreshContext): 'open' | string {
  if (ctx.params.encounter_id === 'open') {
    return 'open'
  }
  return getRequiredUUIDParam(ctx, 'encounter_id')
}

type EncounterPageProps = {
  patient: HasStringId<PatientWithOpenEncounter>
  encounter: RenderedPatientEncounter
  current_encounter_step: EncounterStep
  encounter_provider: RenderedPatientEncounterProvider
  this_visit_records: ThisVisitRecords
  patient_history: RenderedPatientHistory
  previously_completed?: boolean
}

export type EncounterContext = LoggedInHealthWorkerContext<
  EncounterPageProps
>

const nav_links = ENCOUNTER_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/encounters/:encounter_id/${step}`,
}))

const next_links_by_step = groupByMapped(
  nav_links,
  (link) => link.step,
  (link, i) => {
    const next_link = nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, nav_links.length - 1)
      assertEquals(link.step, 'close_visit')
    }
    return {
      route: next_link?.route ||
        `/app/patients/:patient_id/encounters/open/vitals`,
      button_text: next_link ? `Continue` : 'Conclude visit',
    }
  },
)

const nextStep = ({ state: { current_encounter_step } }: EncounterContext) => {
  const next_link = next_links_by_step.get(current_encounter_step)
  assert(next_link, `No next link for step ${current_encounter_step}`)
  return next_link
}

const nextLink = (ctx: EncounterContext) =>
  replaceParams(nextStep(ctx).route, ctx.params)

export async function completeStep(ctx: EncounterContext) {
  const step = nav_links.find((link) => ctx.route.startsWith(link.route))?.step
  assert(step)
  await completedStep(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    step,
  })
  return redirect(nextLink(ctx))
}

function stepFromUrl(ctx: EncounterContext) {
  const step = ctx.route.replace(
    '/app/patients/:patient_id/encounters/:encounter_id/',
    '',
  )
  if (step.includes('/')) {
    return step.split('/')[0]
  }
  return step
}

export async function handler(
  req: Request,
  ctx: EncounterContext,
) {
  const encounter_id = getEncounterId(ctx)
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const { trx, health_worker } = ctx.state

  // TODO: Do this as part of an earlier POST request
  const promised_encounter = removeFromWaitingRoomAndAddSelfAsProvider(
    trx,
    {
      encounter_id,
      patient_id,
      health_worker,
    },
  )

  if (encounter_id === 'open' && req.method === 'GET') {
    const { encounter } = await promised_encounter
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

  // TODO once removeFromWaitingRoomAndAddSelfAsProvider is converted to a POST,
  // we can get the encounter_provider from the open_encounters without this intermittent await
  const { encounter, encounter_provider } = await promised_encounter
  const {
    patient,
    this_visit_records,
    patient_history,
  } = await promiseProps({
    patient: patients.getWithOpenEncounter(trx, {
      ids: [patient_id],
      health_worker_id: health_worker.id,
    }).then((patients) => patients[0]),
    this_visit_records: getThisVisitRecords(trx, {
      encounter_id,
      encounter_provider_id: encounter_provider.patient_encounter_provider_id,
    }),
    patient_history: getPatientHistory(trx, {
      encounter_id,
      encounter_provider_id: encounter_provider.patient_encounter_provider_id,
    }),
  })

  const step = stepFromUrl(ctx)
  const getting_json = req.method === 'GET' &&
    req.headers.get('accept') === 'application/json'

  if (!getting_json) {
    const next_incomplete_step = ENCOUNTER_STEPS.find((step) =>
      !encounter.steps_completed.includes(step)
    )
    assertOrRedirect(
      isEncounterStep(step),
      `/app/patients/${patient_id}/encounters/${encounter_id}/${
        next_incomplete_step || 'vitals'
      }`,
    )
  }

  const previously_completed = encounter.steps_completed.includes(
    step as unknown as EncounterStep,
  )

  const encounter_props: EncounterPageProps = {
    patient,
    encounter,
    encounter_provider,
    previously_completed,
    this_visit_records,
    patient_history,
    current_encounter_step: step as EncounterStep,
  }

  Object.assign(ctx.state, encounter_props)

  return ctx.next()
}

export function EncounterLayout({
  ctx,
  next_step_text,
  children,
}: {
  ctx: EncounterContext
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
          steps_completed={ctx.state.encounter.steps_completed}
        />
      }
      drawer={
        <PatientDrawerV3
          patient={ctx.state.patient}
          encounter={ctx.state.encounter}
          current_encounter_step={ctx.state.current_encounter_step}
          this_visit_records={ctx.state.this_visit_records}
          patient_history={ctx.state.patient_history}
          care_team={ctx.state.patient.primary_doctor
            ? [{ ...ctx.state.patient.primary_doctor, profession: 'doctor' }]
            : []}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Form method='POST' id='encounter'>
        {children}
        <hr />
        <ButtonsContainer>
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

export function EncounterPage<
  Context extends EncounterContext = EncounterContext,
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
    ctx: EncounterContext,
  ) {
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
      <EncounterLayout
        ctx={ctx}
        next_step_text={next_step_text}
      >
        {children}
      </EncounterLayout>
    )
  }
}
