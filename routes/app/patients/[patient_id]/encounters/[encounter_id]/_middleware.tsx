import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  Sendable,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import * as send_to from '../../../../../../db/models/send_to.ts'
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
import { assertOr404 } from '../../../../../../util/assertOr.ts'
import { ButtonsContainer } from '../../../../../../islands/form/buttons.tsx'
import { SendToButton } from '../../../../../../islands/SendTo/Button.tsx'
import { Button } from '../../../../../../components/library/Button.tsx'
import { EncounterStep } from '../../../../../../db.d.ts'

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

export const nextLink = ({ route, params }: FreshContext) => {
  const current_index = nav_links.findIndex(
    (link) => link.route === route,
  )
  assert(current_index >= 0)
  const next_link = nav_links[current_index + 1]
  if (!next_link) {
    return replaceParams(
      `/app/patients/:patient_id/encounters/:encounter_id/vitals`,
      params,
    )
  }
  assert(next_link)
  return replaceParams(next_link.route, params)
}

export function EncounterLayout({
  ctx,
  sendables,
  children,
}: {
  ctx: EncounterContext
  sendables: Sendable[]
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
      <Form method='POST'>
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
            {nextStep(ctx).button_text}
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

type EncounterPageChildProps = EncounterPageProps & {
  ctx: EncounterContext
  previously_completed: boolean
}

export function EncounterPage(
  render: (
    props: EncounterPageChildProps,
  ) => JSX.Element | Promise<JSX.Element>,
) {
  return async function (
    _req: Request,
    ctx: EncounterContext,
  ) {
    const { patient } = ctx.state
    const step = ctx.route.split('/').pop()!
    const previously_completed = ctx.state.encounter.steps_completed.includes(
      step as unknown as EncounterStep,
    )
    const getting_sendables = send_to.forPatientEncounter(
      ctx.state.trx,
      patient.id,
    )

    const children = await render({ ctx, ...ctx.state, previously_completed })

    return (
      <EncounterLayout ctx={ctx} sendables={await getting_sendables}>
        {children}
      </EncounterLayout>
    )
  }
}
