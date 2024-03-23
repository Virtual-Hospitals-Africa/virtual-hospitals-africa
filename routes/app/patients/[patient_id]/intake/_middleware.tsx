import { ComponentChildren, JSX } from 'preact'
import Layout from '../../../../../components/library/Layout.tsx'
import Form from '../../../../../islands/form/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  PatientIntake,
} from '../../../../../types.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { assertOr404, assertOrRedirect } from '../../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import { StepsSidebar } from '../../../../../components/library/Sidebar.tsx'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../util/redirect.ts'
import { INTAKE_STEPS, isIntakeStep } from '../../../../../shared/intake.ts'
import { replaceParams } from '../../../../../util/replaceParams.ts'
import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../../../../db/models/patient_encounters.ts'

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
  await removeFromWaitingRoomAndAddSelfAsProvider(ctx.state.trx, {
    patient_id,
    encounter_id: 'open',
    health_worker: ctx.state.healthWorker,
  })

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

  await patients.upsertIntake(ctx.state.trx, {
    ...patient,
    id: ctx.state.patient.id,
    completed_intake: patient.completed_intake || (step === 'review'),
    intake_step_just_completed: step,
  })

  return redirect(nextLink(ctx))
}

export function assertAgeYearsKnown(ctx: IntakeContext): number {
  const { patient } = ctx.state
  const age_years = patient.age?.age_years
  const warning = encodeURIComponent(
    "Please fill out the patient's personal information beforehand.",
  )
  assertOrRedirect(
    age_years != null,
    `/app/patients/${patient.id}/intake/personal?warning=${warning}`,
  )
  return age_years
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
      <Form method='POST'>
        {children}
      </Form>
    </Layout>
  )
}
