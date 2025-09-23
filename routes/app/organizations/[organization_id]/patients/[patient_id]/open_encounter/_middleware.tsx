import { ComponentChildren, JSX } from 'preact'
import { assert } from 'std/assert/assert.ts'
import Layout from '../../../../../../../components/library/Layout.tsx'
import Form from '../../../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  Maybe,
  RenderedPatient,
  RenderedPatientEncounterEmployee,
  RenderedPatientHistory,
  RenderedPatientOpenEncounter,
  ThisVisitRecords,
  WorkflowStatus,
  WorkflowStatusInProgress,
} from '../../../../../../../types.ts'
import * as patients from '../../../../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../../../../db/models/patient_encounters.ts'
import { get as getThisVisitRecords } from '../../../../../../../db/models/this_visit_records.ts'
import { get as getPatientHistory } from '../../../../../../../db/models/patient_history.ts'

import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import { StepsSidebar } from '../../../../../../../components/library/Sidebar.tsx'
import capitalize from '../../../../../../../util/capitalize.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { ButtonsContainer } from '../../../../../../../islands/form/buttons.tsx'
import { Button } from '../../../../../../../components/library/Button.tsx'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'

import {
  assertOr400,
  assertOr404,
  assertOr405,
  assertOrRedirect,
} from '../../../../../../../util/assertOr.ts'
import PatientDrawerV3 from '../../../../../../../islands/patient-drawer-v3/DrawerV3.tsx'
import { PatientPresence, Workflow } from '../../../../../../../db.d.ts'
import {
  firstIncompleteStep,
  firstIncompleteStepStatus,
  firstStep,
  isWorkflow,
  lastStep,
  WORKFLOW_STEPS,
} from '../../../../../../../shared/workflow.ts'
import mapEntries from '../../../../../../../util/mapEntries.ts'
import {
  completedStep,
  completedWorkflow,
} from '../../../../../../../db/models/patient_workflows.ts'
import last from '../../../../../../../util/last.ts'
import compact from '../../../../../../../util/compact.ts'
import { OrganizationContext, OrganizationState } from '../../../_middleware.ts'
import words from '../../../../../../../util/words.ts'
import first from '../../../../../../../util/first.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { success } from '../../../../../../../util/alerts.ts'

type OpenEncounterState = OrganizationState & {
  patient: RenderedPatient
  encounter: RenderedPatientOpenEncounter
  encounter_employee_presence: RenderedPatientEncounterEmployee | null
}

type WorkflowState = {
  workflow: Workflow
  workflow_status: WorkflowStatus
  step: string
  encounter_employee_presence: RenderedPatientEncounterEmployee
  this_visit_records: ThisVisitRecords
  patient_history: RenderedPatientHistory
}

type OpenEncounterWorkflowState = OpenEncounterState & WorkflowState

export type OpenEncounterContext = LoggedInHealthWorkerContext<
  OpenEncounterState
>

export type OpenEncounterWorkflowContext = LoggedInHealthWorkerContext<
  OpenEncounterWorkflowState
>

const nav_links: {
  [w in Workflow]: {
    step: string
    route: string
  }[]
} = mapEntries(WORKFLOW_STEPS, (steps, workflow) =>
  steps.map((step) => ({
    step,
    route:
      `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${step}`,
  })))

export function completeLastStep(
  { state: { trx, workflow, step, workflow_status } }:
    OpenEncounterWorkflowContext,
) {
  assertEquals(
    step,
    lastStep(workflow),
    'Call this function only for the last step',
  )

  const steps_completed_previously: string[] = workflow_status.steps_completed
  const first_incomplete_step = firstIncompleteStep(
    workflow,
    steps_completed_previously,
  )
  assert(first_incomplete_step)
  const { patient_workflow_id } = workflow_status

  return promiseProps({
    completed_step: completedStep(trx, {
      workflow,
      step,
      patient_workflow_id,
    }),
    completed_workflow: completedWorkflow(trx, {
      patient_workflow_id,
    }),
  })
}

export async function completeAndProceedToNextStep(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    workflow,
    step,
    workflow_status,
  } = ctx.state
  assertNotEquals(
    step,
    lastStep(workflow),
    'Expected all steps to be completed only on the last step',
  )

  const steps_completed_previously: string[] = workflow_status.steps_completed
  const already_completed = steps_completed_previously.includes(step)
  if (!already_completed) {
    await completedStep(ctx.state.trx, {
      workflow,
      step,
      patient_workflow_id: workflow_status.patient_workflow_id,
    })
  }

  const steps_completed = already_completed
    ? steps_completed_previously
    : steps_completed_previously.concat([step])

  const first_incomplete_step = firstIncompleteStep(workflow, steps_completed)
  assert(first_incomplete_step)

  return redirect(
    replaceParams(
      `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${first_incomplete_step}`,
      ctx.params,
    ),
  )
}

function workflowStepFromUrl(
  ctx: OpenEncounterContext,
): { workflow: Workflow; step: string } {
  const [workflow, step] = compact(
    ctx.route.replace(
      '/app/organizations/:organization_id/patients/:patient_id/open_encounter/',
      '',
    ).split('/'),
  )
  assert(isWorkflow(workflow), `Invalid workflow: ${workflow}`)
  assert(WORKFLOW_STEPS[workflow].includes(step), `Invalid step: ${step}`)
  return { workflow, step }
}

export function getWorkflowStatusInProgress(
  ctx: OpenEncounterContext,
  workflow: Workflow,
): WorkflowStatusInProgress {
  const { status, workflows } = ctx.state.encounter
  assertOr405(
    status.patient_presence.current_workflow === workflow,
    `${workflow} is not the current workflow`,
  )
  const workflow_status = workflows[workflow]
  assert(workflow_status, `No workflow status found for ${workflow}`)
  assert(workflow_status.status === 'in progress')

  return workflow_status
}

export async function workflowHandler(
  _req: Request,
  ctx: OpenEncounterContext,
) {
  const { trx, encounter, encounter_employee_presence } = ctx.state
  const { workflow, step } = workflowStepFromUrl(ctx)

  const workflow_status = getWorkflowStatusInProgress(ctx, workflow)

  assertOr400(
    encounter_employee_presence,
    `You must start the workflow before accessing one of its pages`,
  )

  const { patient_encounter_id } = encounter

  const {
    this_visit_records,
    patient_history,
  } = await promiseProps({
    this_visit_records: getThisVisitRecords(trx, {
      patient_encounter_id,
      patient_encounter_employee_id:
        encounter_employee_presence.patient_encounter_employee_id,
    }),
    patient_history: getPatientHistory(trx, {
      patient_encounter_id,
      patient_encounter_employee_id:
        encounter_employee_presence.patient_encounter_employee_id,
    }),
  })

  const workflow_props: WorkflowState = {
    workflow,
    step,
    workflow_status,
    this_visit_records,
    patient_history,
    encounter_employee_presence,
  }

  Object.assign(ctx.state, workflow_props)

  return ctx.next()
}

export async function handler(
  _req: Request,
  ctx: OrganizationContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const { trx, health_worker, organization_employment } = ctx.state

  let encounter: Maybe<RenderedPatientOpenEncounter> =
    health_worker.present_encounter
  if (encounter) {
    assertOr400(
      encounter.patient.id === patient_id,
      'You are present with another patient. End that workflow first before seeing a new patient.',
    )
  } else {
    encounter = await patient_encounters.getOpen(trx, {
      patient_id,
    }).then(first)
  }

  assertOr404(
    encounter,
    'No open encounter for this patient at this organization',
  )
  const patient = await patients.getById(trx, patient_id)

  const encounter_employee_presence =
    encounter.status.patient_presence.employees.find((
      employee,
    ) => employee.employment_id === organization_employment.non_admin_id) ??
      null

  assert(encounter_employee_presence, 'No encounter employee found')

  const encounter_props: OpenEncounterState = {
    ...ctx.state,
    encounter,
    encounter_employee_presence,
    patient,
  }

  Object.assign(ctx.state, encounter_props)

  return ctx.next()
}

export function assertAllPriorStepsCompleted(
  ctx: OpenEncounterWorkflowContext,
) {
  const { workflow, workflow_status } = ctx.state
  const workflow_steps = WORKFLOW_STEPS[workflow]
  const last_step = last(workflow_steps)
  assertEquals(
    ctx.state.step,
    last_step,
    `Only call this function on the very last step of ${workflow}, which is ${last_step}`,
  )
  const steps_completed = new Set(workflow_status.steps_completed)
  const incomplete_step = workflow_steps.find((step) =>
    step !== last_step && !steps_completed.has(step)
  )
  if (!incomplete_step) return
  const is_plural = incomplete_step.endsWith('s')
  const pretty_name = is_plural
    ? incomplete_step
    : incomplete_step + ' information'
  const warning = encodeURIComponent(
    `Please fill out the ${
      pretty_name.replace('_', ' ')
    } form before completing ${words(workflow).join(' ')}.`,
  )
  const url = replaceParams(
    `/app/organizations/:organization_id/patients/:patient_id/${workflow}/${incomplete_step}`,
    ctx.params,
  )
  assertOrRedirect(false, `${url}?warning=${warning}`)
}

export function OpenEncounterWorkflowLayout({
  ctx,
  next_step_text,
  children,
}: {
  ctx: OpenEncounterWorkflowContext
  next_step_text?: string
  children: ComponentChildren
}): JSX.Element {
  return (
    <Layout
      title={capitalize(ctx.state.workflow)}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links[ctx.state.workflow]}
          steps_completed={ctx.state.workflow_status.steps_completed}
        />
      }
      // TODO revisit when we show the drawer and/or handle this differently
      drawer={ctx.state.workflow !== 'registration'
        ? (
          <PatientDrawerV3
            patient={ctx.state.patient}
            encounter={ctx.state.encounter}
            current_seeking_treatment_step={ctx.state.step}
            this_visit_records={ctx.state.this_visit_records}
            patient_history={ctx.state.patient_history}
            care_team={ctx.state.patient.primary_doctor
              ? [{ ...ctx.state.patient.primary_doctor, profession: 'doctor' }]
              : []}
          />
        )
        : null}
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
            {next_step_text || 'Save'}
            {/* {next_step_text || nextStep(ctx).button_text} */}
          </Button>
        </ButtonsContainer>
      </Form>
    </Layout>
  )
}

export function OpenEncounterWorkflowPage<
  Context extends OpenEncounterWorkflowContext = OpenEncounterWorkflowContext,
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
    ctx: OpenEncounterWorkflowContext,
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
      <OpenEncounterWorkflowLayout
        ctx={ctx}
        next_step_text={next_step_text}
      >
        {children}
      </OpenEncounterWorkflowLayout>
    )
  }
}

export function WorkflowRedirectPage(
  _req: Request,
  ctx: OpenEncounterContext,
) {
  const workflow = last(ctx.route.split('/'))
  assert(workflow)
  assert(isWorkflow(workflow))
  const workflow_status = getWorkflowStatusInProgress(ctx, workflow)
  const first_incomplete_step = firstIncompleteStepStatus(workflow_status)
  assert(first_incomplete_step)
  return redirect(
    replaceParams(
      `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${first_incomplete_step}`,
      ctx.params,
    ),
  )
}

export function nextRouteAfterCompletingWorkflow(
  { state: { workflow, organization, patient } }: OpenEncounterWorkflowContext,
  next_patient_presence: Pick<
    PatientPresence,
    'department_name' | 'current_workflow' | 'next_workflow'
  >,
) {
  const next_current_workflow = next_patient_presence.current_workflow

  if (next_current_workflow) {
    const success_message = `${
      capitalize(workflow, { splitHyphen: true })
    } is complete. Continuing with ${
      capitalize(next_current_workflow, { splitHyphen: true })
    }`
    const next_route =
      `/app/organizations/${organization.id}/patients/${patient.id}/open_encounter/${next_current_workflow}/${
        firstStep(next_current_workflow)
      }`
    return success(success_message, next_route)
  }

  assertEquals(
    next_patient_presence.department_name,
    'waiting room',
  )
  assert(
    next_patient_presence.next_workflow,
  )
  const success_message = `${
    capitalize(workflow)
  } is complete. Please guide the patient to the waiting room to await ${
    capitalize(next_patient_presence.next_workflow, { splitHyphen: true })
  }`
  const next_route =
    `/app/organizations/${organization.id}/waiting_room?just_encountered_patient_id=${patient.id}`
  return success(success_message, next_route)
}
