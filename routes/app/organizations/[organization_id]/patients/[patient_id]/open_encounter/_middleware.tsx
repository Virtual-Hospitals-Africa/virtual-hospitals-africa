import { ComponentChildren, JSX } from 'preact'
import { assert } from 'std/assert/assert.ts'
import Form from '../../../../../../../components/library/Form.tsx'
import {
  LoggedInHealthWorkerContext,
  PreviouslyCompletedProcedures,
  RenderedPatient,
  RenderedPatientEncounterEmployee,
  RenderedPatientHistory,
  RenderedPatientOpenEncounter,
  RenderedRecordRelativeToHealthWorker,
  WorkflowStatus,
  WorkflowStatusInProgress,
} from '../../../../../../../types.ts'
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

import { PatientPresence, Workflow } from '../../../../../../../db.d.ts'
import {
  firstIncompleteStep,
  firstIncompleteStepStatus,
  firstStep,
  isWorkflow,
  lastStep,
  WORKFLOW_SNOMED_CONCEPT_IDS,
  WORKFLOW_STEPS,
  workflowStepSnomedConceptId,
} from '../../../../../../../shared/workflow.ts'
import mapEntries from '../../../../../../../util/mapEntries.ts'
import {
  completedStep,
  completedWorkflow,
  PresentWithAnotherPatientError,
} from '../../../../../../../db/models/patient_workflows.ts'
import last from '../../../../../../../util/last.ts'
import compact from '../../../../../../../util/compact.ts'
import { OrganizationContext, OrganizationState } from '../../../_middleware.ts'
import words from '../../../../../../../util/words.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { success } from '../../../../../../../util/alerts.ts'
import { ComponentChild } from 'preact'
import { patient_procedures } from '../../../../../../../db/models/patient_procedures.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../../../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { presentWithPatient } from '../../../../../../../shared/patient_encounters.ts'
import { exists } from '../../../../../../../util/exists.ts'
import matching from '../../../../../../../util/matching.ts'
import { HealthWorkerSidebarBottom } from '../../../../../../../components/library/HealthWorkerSidebarBottom.tsx'
import { parseExpressionExpectingType } from '../../../../../../../shared/s_expression.ts'
import PatientDrawerV4 from '../../../../../../../components/drawer-v4/DrawerV4.tsx'

type OpenEncounterState = OrganizationState & {
  patient: RenderedPatient
  encounter: RenderedPatientOpenEncounter
  encounter_employee_presence: RenderedPatientEncounterEmployee | null
}

type WorkflowState = {
  workflow: Workflow
  step: string
  workflow_snomed_concept_id: string
  workflow_step_snomed_concept_id: string | null
  workflow_status: WorkflowStatus
  previously_completed_step: boolean
  previously_completed_procedures: PreviouslyCompletedProcedures
  encounter_employee_presence: RenderedPatientEncounterEmployee
  this_visit_records: RenderedRecordRelativeToHealthWorker[]
  patient_history: RenderedPatientHistory
}

type OpenEncounterWorkflowState = OpenEncounterState & WorkflowState

export type OpenEncounterContext<T = Record<never, never>> =
  LoggedInHealthWorkerContext<
    OpenEncounterState & T
  >

export type OpenEncounterWorkflowContext<T = Record<never, never>> =
  LoggedInHealthWorkerContext<
    OpenEncounterWorkflowState & T
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

export async function completeStep(
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

  return {
    steps_completed,
    first_incomplete_step,
  }
}

export async function completeAndProceedToNextStep(
  ctx: OpenEncounterWorkflowContext,
) {
  const { workflow } = ctx.state
  const { first_incomplete_step } = await completeStep(ctx)

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
    ctx.route!.replace(
      '/app/organizations/:organization_id/patients/:patient_id/open_encounter/',
      '',
    ).split('/'),
  )
  assert(isWorkflow(workflow), `Invalid workflow: ${workflow}`)
  assertOrRedirect(
    step,
    `/app/organizations/${ctx.state.encounter.organization.id}/patients/${ctx.state.encounter.patient.id}/open_encounter/${ctx.state.encounter.status.patient_presence.current_workflow}/${
      firstIncompleteStepStatus(getWorkflowStatusInProgress(ctx, workflow))
    }`,
  )
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

  const workflow_snomed_concept_id = WORKFLOW_SNOMED_CONCEPT_IDS[workflow]

  const workflow_step_snomed_concept_id = workflowStepSnomedConceptId(
    workflow,
    step,
  )

  const {
    this_visit_records,
    patient_history,
    previously_completed_procedures,
  } = await promiseProps({
    this_visit_records: getThisVisitRecords(trx, {
      encounter,
      health_worker_id: ctx.state.health_worker.id,
    }),
    patient_history: getPatientHistory(trx, {
      patient_encounter_id,
      patient_encounter_employee_id:
        encounter_employee_presence.patient_encounter_employee_id,
    }),
    previously_completed_procedures: patient_procedures.previouslyCompleted(
      trx,
      {
        patient_encounter_id,
        workflow_snomed_concept_id,
        workflow_step_snomed_concept_id,
      },
    ),
  })

  const previously_completed_step = workflow_status.steps_completed.includes(
    step,
  )

  const workflow_props: WorkflowState = {
    workflow,
    step,
    workflow_status,
    patient_history,
    this_visit_records,
    previously_completed_step,
    encounter_employee_presence,
    workflow_step_snomed_concept_id,
    previously_completed_procedures,
    workflow_snomed_concept_id: WORKFLOW_SNOMED_CONCEPT_IDS[workflow],
  }

  Object.assign(ctx.state, workflow_props)

  return ctx.next()
}

async function findPatientOpenEncounter(
  ctx: OrganizationContext,
): Promise<RenderedPatientOpenEncounter> {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const { present_encounter, trx } = ctx.state
  if (present_encounter) {
    if (present_encounter.patient.id !== patient_id) {
      throw new PresentWithAnotherPatientError(present_encounter)
    }
    return present_encounter
  }

  const patient_encounter = await patient_encounters.getFirstOpen(trx, {
    patient_id,
  })
  assertOr404(
    patient_encounter,
    'No open encounter for this patient at this organization',
  )
  return patient_encounter as RenderedPatientOpenEncounter
}

export async function handler(
  ctx: OrganizationContext,
) {
  const { trx, organization_employment } = ctx.state

  const encounter = await findPatientOpenEncounter(ctx)

  const present_with_patient = presentWithPatient(encounter)
  const encounter_employee_presence = exists(
    present_with_patient.find(
      matching({
        employee_id: organization_employment.employment_id,
      }),
    ),
  )

  const encounter_props: OpenEncounterState = {
    ...ctx.state,
    encounter,
    encounter_employee_presence,
    patient: encounter.patient,
  }

  Object.assign(ctx.state, encounter_props)

  const response = await ctx.next()

  // Run assertions to ensure any modifications to encounters
  if (ctx.req.method === 'POST') {
    await patient_encounters.getById(trx, encounter.patient_encounter_id)
  }

  return response
}

export function assertAllPriorStepsCompleted(
  ctx: OpenEncounterWorkflowContext,
) {
  const { workflow, workflow_status } = ctx.state
  const workflow_steps = WORKFLOW_STEPS[workflow]
  const this_workflow_step_index = workflow_steps.indexOf(ctx.state.step)
  assert(this_workflow_step_index !== -1)

  const prior_workflow_steps = workflow_steps.slice(0, this_workflow_step_index)
  const steps_completed = new Set(workflow_status.steps_completed)

  const incomplete_step = prior_workflow_steps.find((step) =>
    !steps_completed.has(step)
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
  buttons,
  children,
}: {
  ctx: OpenEncounterWorkflowContext
  next_step_text?: string
  buttons?: ComponentChild
  children: ComponentChildren
}): JSX.Element {
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      url={ctx.url}
      title={capitalize(ctx.state.workflow)}
      sidebar={
        <StepsSidebar
          ctx={ctx}
          nav_links={nav_links[ctx.state.workflow]}
          steps_completed={ctx.state.workflow_status.steps_completed}
          bottom={<HealthWorkerSidebarBottom employee={ctx.state.employee} />}
        />
      }
      drawer={ctx.state.workflow !== 'registration'
        ? (
          <PatientDrawerV4
            patient={ctx.state.patient}
            encounter={ctx.state.encounter}
            this_visit_records={ctx.state.this_visit_records}
            patient_history={ctx.state.patient_history}
            current_workflow_state={{
              workflow: ctx.state.workflow,
              step: ctx.state.step,
              workflow_snomed_concept_id: ctx.state.workflow_snomed_concept_id,
              workflow_step_snomed_concept_id:
                ctx.state.workflow_step_snomed_concept_id,
              workflow_status: ctx.state.workflow_status,
            }}
            care_team={[]}
            // care_team={ctx.state.patient.primary_doctor
            //   ? [{ ...ctx.state.patient.primary_doctor, profession: 'doctor' }]
            //   : []}
          />
        )
        : undefined}
    >
      <Form method='POST' className='min-h-full relative'>
        <div className='pr-4 min-h-full'>
          {children}
        </div>
        <ButtonsContainer className='absolute bottom-0 left-0 right-0'>
          {buttons || (
            <Button
              type='submit'
              className='flex-1 max-w-xl'
            >
              {next_step_text || 'Next'}
            </Button>
          )}
        </ButtonsContainer>
      </Form>
    </HealthWorkerContentsWithSidebarAndDrawer>
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
    | Promise<{ buttons: ComponentChild; children: JSX.Element }>
    | Promise<Response>
    | Promise<Response | JSX.Element>,
) {
  return async function (
    ctx: OpenEncounterWorkflowContext,
  ) {
    const rendered = await render(ctx as Context)

    if (rendered instanceof Response) {
      return rendered
    }

    let next_step_text: string | undefined
    let buttons: ComponentChild | undefined
    let children = rendered
    if ('next_step_text' in rendered) {
      next_step_text = rendered.next_step_text as string
      children = rendered.children
    }
    if ('buttons' in rendered) {
      buttons = rendered.buttons as string
      children = rendered.children
    }

    return (
      <OpenEncounterWorkflowLayout
        ctx={ctx}
        next_step_text={next_step_text}
        buttons={buttons}
      >
        {children}
      </OpenEncounterWorkflowLayout>
    )
  }
}

export function WorkflowRedirectPage(
  ctx: OpenEncounterContext,
) {
  const workflow = last(ctx.route!.split('/'))
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
    'Waiting room',
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

export function createProcedureIfNotAlreadyCompleted(
  ctx: OpenEncounterWorkflowContext,
) {
  const previously_completed_procedure_record_id =
    ctx.state.workflow_step_snomed_concept_id
      ? ctx.state.previously_completed_procedures.workflow_step_record_id
      : ctx.state.previously_completed_procedures.workflow_record_id
  if (previously_completed_procedure_record_id) {
    return Promise.resolve({
      procedure_id: previously_completed_procedure_record_id,
    })
  }

  const procedure_snomed_concept_id =
    ctx.state.workflow_step_snomed_concept_id ||
    ctx.state.workflow_snomed_concept_id
  return patient_procedures.insertOneNested(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    employment_id: ctx.state.encounter_employee_presence.employee_id,
    procedure: parseExpressionExpectingType(
      `(procedure ${procedure_snomed_concept_id})`,
      'procedure',
    ),
  })
}
