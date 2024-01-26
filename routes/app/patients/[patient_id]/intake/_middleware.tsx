import { ComponentChildren, JSX } from 'preact'
import { Container } from '../../../../../components/library/Container.tsx'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../components/library/form/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  PatientIntake,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import {
  replaceParams,
  StepsSidebar,
} from '../../../../../components/library/Sidebar.tsx'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../encounters/[encounter_id]/_middleware.tsx'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'
import uniq from '../../../../../util/uniq.ts'
import { INTAKE_STEPS, isIntakeStep } from '../../../../../shared/intake.ts'

type AdditionalContext = {
  is_review: false
  patient: PatientIntake
} | {
  is_review: true
  patient: Awaited<ReturnType<typeof patients.getIntakeReview>>
}

export type IntakeContext = LoggedInHealthWorkerContext<AdditionalContext>

export async function handler(
  _req: Request,
  ctx: IntakeContext,
) {
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const is_review = ctx.route.endsWith('/review')

  const getPatient = is_review ? patients.getIntakeReview : patients.getIntake

  const getting_patient = getPatient(ctx.state.trx, {
    id: patient_id,
  })

  // TODO: use the encounter as part of intake?
  await removeFromWaitingRoomAndAddSelfAsProvider(ctx, 'open')

  const patient = await getting_patient
  assertOr404(patient, 'Patient not found')

  ctx.state.is_review = is_review
  ctx.state.patient = patient
  return ctx.next()
}

const intake_nav_links = INTAKE_STEPS.map((step) => ({
  step,
  route: `/app/patients/:patient_id/intake/${step}`,
}))

export const nextLink = ({ route, params }: FreshContext) => {
  const current_index = intake_nav_links.findIndex(
    (link) => link.route === route,
  )
  assert(current_index >= 0)
  const next_link = intake_nav_links[current_index + 1]
  if (!next_link) {
    return replaceParams(
      `/app/patients/:patient_id/encounters/open/vitals`,
      params,
    )
  }
  assert(next_link)
  return replaceParams(next_link.route, params)
}

export async function upsertPatientAndRedirect(
  ctx: IntakeContext,
  patient: Omit<patients.UpsertPatientIntake, 'id' | 'intake_steps_completed'>,
) {
  const step = ctx.route.split('/').pop()
  assert(step)
  assert(isIntakeStep(step))
  const intake_steps_completed = uniq([
    ...ctx.state.patient.intake_steps_completed,
    step,
  ])
  const completed_intake = intake_steps_completed.length === INTAKE_STEPS.length
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  await patients.upsertIntake(ctx.state.trx, {
    ...patient,
    id: patient_id,
    intake_steps_completed,
    completed_intake,
  })

  return redirect(nextLink(ctx))
}

export function IntakeLayout({
  ctx,
  children,
}: { ctx: IntakeContext; children: ComponentChildren }): JSX.Element {
  return (
    <Layout
      title='Patient Intake'
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={intake_nav_links}
          steps_completed={ctx.state.patient.intake_steps_completed}
        />
      }
      url={ctx.url}
      variant='form'
    >
      <Container size='lg'>
        <Form method='POST'>
          {children}
        </Form>
      </Container>
    </Layout>
  )
}
