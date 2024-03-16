import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import { Container } from '../../../../../../components/library/Container.tsx'
import Layout from '../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../islands/form/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
} from '../../../../../../types.ts'
import * as patients from '../../../../../../db/models/patients.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
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

export function getEncounterId(ctx: FreshContext): 'open' | number {
  if (ctx.params.encounter_id === 'open') {
    return 'open'
  }
  return getRequiredNumericParam(ctx, 'encounter_id')
}

export type EncounterContext = LoggedInHealthWorkerContext<
  {
    encounter: RenderedPatientEncounter
    encounter_provider: RenderedPatientEncounterProvider
    patient: patients.PatientCard
  }
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
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

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
  children,
}: { ctx: EncounterContext; children: ComponentChildren }): JSX.Element {
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
      <Container size='md'>
        <Form method='POST'>
          {children}
        </Form>
      </Container>
    </Layout>
  )
}
