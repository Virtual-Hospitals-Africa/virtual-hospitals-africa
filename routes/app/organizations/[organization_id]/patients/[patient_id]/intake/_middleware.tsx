import { ComponentChildren, JSX } from 'preact'
import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../../components/library/Form.tsx'
import { Address, Maybe, Patient } from '../../../../../../../types.ts'
import * as patient_address from '../../../../../../../db/models/patient_address.ts'
import * as patient_personal from '../../../../../../../db/models/patient_personal.ts'
import * as patient_primary_care from '../../../../../../../db/models/patient_primary_care.ts'
import * as patient_intake_this_visit from '../../../../../../../db/models/patient_intake_this_visit.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../../../components/library/Sidebar.tsx'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { ButtonsContainer } from '../../../../../../../islands/form/buttons.tsx'
import { Button } from '../../../../../../../components/library/Button.tsx'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import { assertOrRedirect } from '../../../../../../../util/assertOr.ts'
import last from '../../../../../../../util/last.ts'
import {
  isPatientIntakeStep,
  PATIENT_INTAKE_STEPS,
  PatientIntakeStep,
} from '../../../../../../../shared/patient_intake.ts'
import { groupByMapped } from '../../../../../../../util/groupBy.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { EncounterReason } from '../../../../../../../db.d.ts'
import { SqlBool } from 'kysely'
import { OrganizationContext } from '../../../_middleware.ts'
// test: waht is this
import { useMemo } from 'preact/hooks'

export function getPatientIntakeId(ctx: FreshContext): 'new' | string {
  if (ctx.params.patient_id === 'new') {
    return 'new'
  }
  return getRequiredUUIDParam(ctx, 'patient_id')
}

export type PatientIntake = {
  personal:
    & Pick<
      Patient,
      | 'name'
      | 'phone_number'
      | 'gender'
      | 'ethnicity'
      | 'first_language'
      | 'date_of_birth'
      | 'national_id_number'
    >
    & {
      id: string
      completed_intake: boolean
      avatar_url: string | null
    }
  primary_care: {
    primary_doctor?: {
      id: string | null
      name: string
    }
    nearest_health_facility?: {
      id: string
      name: string
    }
  }
  this_visit: {
    id: string
    being_taken_by: string
    reason: Maybe<EncounterReason>
    emergency: Maybe<SqlBool>
    department_id: Maybe<string>
    notes: Maybe<string>
  }
  address?: Address
}

type IntakingPatient =
  | { new: true }
  | {
    new: false
    patient: PatientIntake
  }

type PatientIntakePageProps = {
  organization_id: string
  intake: IntakingPatient

  step: PatientIntakeStep
  steps_completed: PatientIntakeStep[]
}

export type PatientIntakeContext = OrganizationContext & {
  state: PatientIntakePageProps
}

//assign every step to a route
//nav_links is an array containing obj. with step and route
const nav_links = PATIENT_INTAKE_STEPS.map((step) => ({
  step,
  route:
    `/app/organizations/:organization_id/patients/:patient_id/intake/${step}`,
}))

//construct next links by step
//analyse nav_links(an array) and group them by step
//groupByMapped(T, KeyBy, ValueBy), nav_links => T, (link) => KeyBy, (link, i) => ValueBy
const next_links_by_step = groupByMapped(
  nav_links,
  (link) => link.step,
  (link, i) => {
    const next_link = nav_links[i + 1]
    if (!next_link) {
      assertEquals(i, nav_links.length - 1)
      assertEquals(link.step, 'biometrics')
    }
    return {
      route: next_link?.route ||
        `/app/organizations/:organization_id/waiting_room?just_encountered_id=:patient_id`,
      button_text: next_link ? `Next` : 'End and Save Intake',
    }
  },
)

const nextStep = (
  { state: { step } }: PatientIntakeContext,
) => {
  const next_link = next_links_by_step.get(step)
  assert(next_link, `No next link for step ${step}`)
  return next_link
}

const nextLink = (ctx: PatientIntakeContext, patient_id: string) => {
  const params = { ...ctx.params }
  if (patient_id) {
    params.patient_id = patient_id
  }
  return replaceParams(nextStep(ctx).route, params)
}

// feat: previous links
const previous_links_by_step = groupByMapped(
  nav_links,
  (link) => link.step,
  (link, i) => {
    const previous_link = nav_links[i - 1]
    // test: bypass assertation
    /*if (!previous_link) {
      assertEquals(i, nav_links.length - 1)
      assertEquals(link.step, 'biometrics')
    }*/
    return {
      route: previous_link?.route ||
        `/app/organizations/:organization_id/waiting_room?just_encountered_id=:patient_id`,
      button_text: `Back`,
    }
  },
)

// feat: previous links
const previousStep = (
  { state: { step } }: PatientIntakeContext,
) => {
  const previous_link = previous_links_by_step.get(step)
  assert(previous_link, `No previous link for step ${step}`)
  return previous_link
}

// feat: previous links
const previousLink = (ctx: PatientIntakeContext, patient_id: string) => {
  const params = { ...ctx.params }
  if (patient_id) {
    params.patient_id = patient_id
  }
  return replaceParams(previousStep(ctx).route, params)
}

function assertProvider(ctx: PatientIntakeContext): string {
  const { provider_id } = ctx.state.organization_employment
  assert(
    provider_id,
    'Only providers can intake patients',
  )
  return provider_id
}

export async function completeStep(
  ctx: PatientIntakeContext,
  patient_id: string,
) {
  const step = nav_links.find((link) => ctx.route.startsWith(link.route))?.step
  assert(step)
  const being_taken_by = assertProvider(ctx)
  if (ctx.state.intake.new) {
    await patient_intake_this_visit.insert(ctx.state.trx, {
      patient_id,
      being_taken_by,
      organization_id: ctx.state.organization.id,
    })
  } else {
    assertEquals(ctx.state.intake.patient.personal.id, patient_id)
    if (ctx.state.step === 'biometrics') {
      await patient_intake_this_visit.startEncounter(ctx.state.trx, {
        patient_intake_id: ctx.state.intake.patient.this_visit.id,
      })
    }
  }

  return redirect(nextLink(ctx, patient_id))
}

function stepFromUrl(ctx: PatientIntakeContext): PatientIntakeStep {
  const step = last(ctx.route.split('/'))
  assertOrRedirect(
    isPatientIntakeStep(step),
    replaceParams(
      '/app/organizations/:organization_id/patients/:patient_id/intake/personal',
      ctx.params,
    ),
  )
  return step
}

export async function handler(
  _req: Request,
  ctx: PatientIntakeContext,
) {
  if (ctx.route.endsWith('/intake')) {
    return redirect(replaceParams(
      '/app/organizations/:organization_id/patients/:patient_id/intake/personal',
      ctx.params,
    ))
  }
  const patient_id = getPatientIntakeId(ctx)
  const organization_id = getRequiredUUIDParam(ctx, 'organization_id')
  const step = stepFromUrl(ctx)

  if (patient_id === 'new' && step !== 'personal') {
    return redirect(replaceParams(
      '/app/organizations/:organization_id/patients/new/intake/personal',
      ctx.params,
    ))
  }

  let patient_intake_props: PatientIntakePageProps
  if (patient_id === 'new') {
    patient_intake_props = {
      organization_id,
      intake: { new: true },
      step,
      steps_completed: [],
    }
  } else {
    const { trx } = ctx.state
    const patient: PatientIntake = await promiseProps({
      personal: patient_personal.getById(trx, { patient_id }),
      primary_care: patient_primary_care.getById(trx, { patient_id }),
      this_visit: patient_intake_this_visit.get(trx, {
        patient_id,
        organization_id,
      }),
      address: patient_address.getById(trx, { patient_id }),
    })

    // To determine whether certain steps are completed we look for the presence of those forms' required fields
    const steps_completed: PatientIntakeStep[] = ['personal' as const]
    if (patient.this_visit.reason && patient.this_visit.department_id) {
      steps_completed.push('this_visit')
    }
    if (
      patient.primary_care.primary_doctor &&
      patient.primary_care.nearest_health_facility
    ) {
      steps_completed.push('primary_care')
    }
    if (
      patient.primary_care.primary_doctor &&
      patient.primary_care.nearest_health_facility
    ) {
      steps_completed.push('primary_care')
    }
    if (
      patient.address?.formatted
    ) {
      steps_completed.push('contacts')
    }
    // TODO revisit when we actually implement biometrics
    if (patient.personal.completed_intake) {
      steps_completed.push('biometrics')
    }

    patient_intake_props = {
      organization_id,
      step,
      steps_completed,
      intake: {
        new: false,
        patient,
      },
    }
  }

  Object.assign(ctx.state, patient_intake_props)
  return ctx.next()
}

// feat: previous links
export function PatientIntakeLayout({
  ctx,
  next_step_text,
  children,
}: {
  ctx: PatientIntakeContext
  next_step_text?: string
  children: ComponentChildren
}): JSX.Element {
  // get previous link
  const patient_id = ctx.state.intake.new
    ? 'new'
    : ctx.state.intake.patient.personal.id
  const prev_link = previousLink(ctx, patient_id)

  return (
    <Layout
      title='Patient Intake'
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
      <Form method='POST' id={`intake-${ctx.state.step}`}>
        {children}
        <hr />
        <ButtonsContainer>
          {/* Back button */}
          <Button
            type='button'
            className='flex-1 max-w-xl'
            // test: what is this
            onClick={() => {
              if (typeof prev_link === 'string' && prev_link) {
                window.location.href = prev_link
              }
            }}
          >
          </Button>
          {/* Next button */}
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

export type PatientIntakePageChildProps = PatientIntakePageProps & {
  ctx: PatientIntakeContext
  previously_completed: boolean
}

export function patientIdentified(
  { state }: PatientIntakeContext,
): PatientIntake {
  assert(
    !state.intake.new,
    'Expected intake to already be past the point where the patient has been identified',
  )
  return state.intake.patient
}

export function PatientIntakePage<
  Context extends PatientIntakeContext = PatientIntakeContext,
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
    ctx: PatientIntakeContext,
  ) {
    assert(ctx.state.organization.location, 'Location not found')
    assertProvider(ctx)

    const { rendered } = await promiseProps({
      rendered: Promise.resolve(
        render(ctx as Context),
      ),
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
      <PatientIntakeLayout
        ctx={ctx}
        next_step_text={next_step_text}
      >
        {children}
      </PatientIntakeLayout>
    )
  }
}
