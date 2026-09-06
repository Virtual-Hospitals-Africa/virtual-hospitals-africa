import { ComponentChildren, JSX } from 'preact'
import { assert } from 'std/assert/assert.ts'
import {
  OpenEncounterContext,
  OpenEncounterState,
  OpenEncounterWorkflowContext,
  OrganizationContext,
  RenderedPatientOpenEncounter,
  WorkflowState,
} from '../../../../../../../types.ts'
import { patient_encounters } from '../../../../../../../db/models/patient_encounters.ts'
import { groupRecordsByWorkflows } from '../../../../../../../db/models/this_visit_findings.ts'
import { patient_history } from '../../../../../../../db/models/patient_history.ts'
import { events } from '../../../../../../../db/models/events.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import capitalize from '../../../../../../../util/capitalize.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'

import { assertOr400, assertOr404, assertOrRedirect } from '../../../../../../../util/assertOr.ts'

import { PatientPresence, Workflow } from '../../../../../../../db.d.ts'
import {
  firstIncompleteStep,
  firstIncompleteStepStatus,
  firstStep,
  isWorkflow,
  lastStep,
  WORKFLOW_NAV_LINKS,
  WORKFLOW_SNOMED_CONCEPTS,
  WORKFLOW_STEPS,
  workflowStepPath,
  workflowStepSnomedConcept,
} from '../../../../../../../shared/workflow.ts'
import { otherEmployeePresentWithPatient, patient_workflows, PresentWithAnotherPatientError } from '../../../../../../../db/models/patient_workflows.ts'
import last from '../../../../../../../util/last.ts'
import compact from '../../../../../../../util/compact.ts'
import words from '../../../../../../../util/words.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { success } from '../../../../../../../util/alerts.ts'
import { ComponentChild } from 'preact'
import { patient_procedures } from '../../../../../../../db/models/patient_procedures.ts'
import { presentWithPatient } from '../../../../../../../shared/patient_encounters.ts'
import matching from '../../../../../../../util/matching.ts'
import { HealthWorkerSidebarBottom } from '../../../../../../../components/library/HealthWorkerSidebarBottom.tsx'
import { parseExpressionExpectingAtom } from '../../../../../../../shared/s_expression.ts'
import { EVALUATION_ACTION, PROCEDURE, TRIAGE_INDEX } from '../../../../../../../shared/snomed_concepts.ts'
import { patientAgeDetermination } from '../../../../../../../shared/patient_age_determination.ts'
import { completedPersonal } from '../../../../../../../shared/patient_registration.ts'
import { OpenEncounterWorkflowLayout } from '../../../../../../../components/OpenEncounterWorkflowLayout.tsx'
import { arrayIsNonEmpty } from '../../../../../../../util/arraySize.ts'
import { diagnoses } from '../../../../../../../db/models/diagnoses.ts'
import { timeMiddlewareCallNext } from '../../../../../../../backend/timeMiddleware.ts'
import { patient_findings } from '../../../../../../../db/models/patient_findings.ts'
import { patient_record_providers } from '../../../../../../../db/models/patient_record_providers.ts'
import { buildPriorityRecord } from '../../../../../../../db/models/priority.ts'
import { patient_evaluation_scores } from '../../../../../../../db/models/patient_evaluation_scores.ts'
import { logToFileIfOnServer } from '../../../../../../../util/logToFileIfOnServer.ts'

export function completeLastStep(
  { state: { trx, workflow, step, workflow_status, patient_encounter_employee_id } }: OpenEncounterWorkflowContext,
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
    completed_step: patient_workflows.completedStep(trx, {
      workflow,
      step,
      patient_workflow_id,
    }),
    completed_workflow: patient_workflows.completedWorkflow(trx, {
      patient_workflow_id,
      patient_encounter_employee_id,
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
  // TODO: parallelize
  if (!already_completed) {
    await patient_workflows.completedStep(ctx.state.trx, {
      workflow,
      step,
      patient_workflow_id: workflow_status.patient_workflow_id,
    })
  }

  const steps_completed = already_completed ? steps_completed_previously : steps_completed_previously.concat([step])

  const first_incomplete_step = firstIncompleteStep(workflow, steps_completed)
  assert(first_incomplete_step)

  await events.insert(ctx.state.trx, {
    type: 'OpenEncounterWorkflowStepCompleted',
    data: {
      patient_id: ctx.state.patient.id,
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      workflow: ctx.state.workflow,
      workflow_step: ctx.state.step,
    },
  })

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
  console.log({ first_incomplete_step })

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
  logToFileIfOnServer(ctx.state.encounter, {
    file_prefix: 'encounter',
  })
  assertOrRedirect(
    step,
    `/app/organizations/${ctx.state.encounter.organization_id}/patients/${ctx.state.encounter.patient.id}/open_encounter/${ctx.state.encounter.status.patient_presence.current_workflow}/${
      firstIncompleteStepStatus(getWorkflowStatus(ctx, workflow))
    }`,
  )
  assert(WORKFLOW_STEPS[workflow].includes(step), `Invalid step: ${step}`)
  return { workflow, step }
}

export function getWorkflowStatus(
  ctx: OpenEncounterContext,
  workflow: Workflow,
) {
  const { workflows } = ctx.state.encounter
  const workflow_status = workflows[workflow]
  assert(workflow_status, `No workflow status found for ${workflow}`)
  return workflow_status
}

export const workflowHandler = timeMiddlewareCallNext(async function workflowHandlerInner(
  ctx: OpenEncounterContext,
) {
  const { trx, encounter, encounter_employee_presence, health_worker_id } = ctx.state
  const { workflow, step } = workflowStepFromUrl(ctx)

  const workflow_status = getWorkflowStatus(ctx, workflow)

  assertOr400(
    encounter_employee_presence,
    `You must start the workflow before accessing one of its pages`,
  )

  const { patient_encounter_id } = encounter
  const { patient_encounter_employee_id } = encounter_employee_presence

  const workflow_snomed_concept = WORKFLOW_SNOMED_CONCEPTS[workflow]

  const workflow_step_snomed_concept = workflowStepSnomedConcept(
    workflow,
    step,
  )

  const fetched = await promiseProps({
    hydrated_findings: patient_findings.findAll(trx, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
    }).then((records) =>
      patient_record_providers.hydrateIntermediateRecords(
        trx,
        { records, health_worker_id, encounter },
      )
    ),
    this_visit_diagnoses: diagnoses.get(trx, {
      encounter,
      health_worker_id,
    }),
    total_scores: patient_evaluation_scores.findAll(
      trx,
      {
        patient_id: encounter.patient.id,
        patient_encounter_id: encounter.patient_encounter_id,
        s_expression: `(evaluation ${EVALUATION_ACTION.s_expression} ${TRIAGE_INDEX.s_expression})`,
      },
    ),
    patient_history: patient_history.get(trx, {
      encounter,
      health_worker_id,
      patient_id: encounter.patient.id,
    }),
    previously_completed_procedures: patient_procedures.previouslyCompleted(
      trx,
      {
        patient_encounter_id,
        workflow_snomed_concept,
        workflow_step_snomed_concept,
      },
    ),
  })

  const previously_completed_step = arrayIsNonEmpty(workflow_status.steps_completed) && workflow_status.steps_completed.includes(
    step,
  )

  const this_visit_findings = groupRecordsByWorkflows(
    {
      encounter,
      records: fetched.hydrated_findings,
      current_workflow_state: {
        workflow,
        step,
        workflow_snomed_concept,
        workflow_step_snomed_concept,
        workflow_status,
      },
    },
  )

  const workflow_props: WorkflowState = {
    workflow,
    step,
    workflow_status,
    previously_completed_step,
    encounter_employee_presence,
    patient_encounter_employee_id,
    workflow_step_snomed_concept,
    this_visit_findings,
    workflow_snomed_concept: WORKFLOW_SNOMED_CONCEPTS[workflow],
    priority_evaluation: encounter.priority &&
      buildPriorityRecord(encounter.priority, fetched.hydrated_findings, fetched.this_visit_diagnoses, fetched.total_scores),
    ...fetched,
  }

  Object.assign(ctx.state, workflow_props)
})

const REQUIRE_EVENTS_ALL_PROCESSED_FOR_PATHS: string[] = [
  workflowStepPath('triage', 'additional_tasks_and_investigations'),
  workflowStepPath('triage', 'assign_priority'),
]

async function findPatientOpenEncounter(
  ctx: OrganizationContext,
): Promise<RenderedPatientOpenEncounter> {
  const { trx, present_encounter_id, organization_employment } = ctx.state
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  if (REQUIRE_EVENTS_ALL_PROCESSED_FOR_PATHS.some((path) => ctx.url.pathname.endsWith(path))) {
    const open_patient_encounters = await patient_encounters.distinctIds(trx, {
      patient_id,
      is_open: true,
    }).execute()
    assert(open_patient_encounters.length <= 2)
    assertOr404(
      open_patient_encounters.length,
      'No open encounter for this patient at this organization',
    )
    await events.allProcessedForEncounter(trx, { patient_encounter_id: open_patient_encounters[0].id })
  }
  const patient_encounter = await patient_encounters.getFirstOpen(trx, {
    patient_id,
  })
  if (present_encounter_id && (present_encounter_id !== patient_encounter?.patient_encounter_id)) {
    const present_encounter = await patient_encounters.getById(trx, present_encounter_id)
    assert(patient_encounters.isOpen(present_encounter))
    const other_employee = await otherEmployeePresentWithPatient(trx, present_encounter, organization_employment)
    throw new PresentWithAnotherPatientError(present_encounter, other_employee)
  }

  assertOr404(
    patient_encounter,
    'No open encounter for this patient at this organization',
  )
  return patient_encounter as RenderedPatientOpenEncounter
}

export const handler = timeMiddlewareCallNext(async function attachOpenEncounter(
  ctx: OrganizationContext,
) {
  const { organization_id, organization_employment } = ctx.state

  const encounter = await findPatientOpenEncounter(ctx)

  const present_with_patient = presentWithPatient(encounter)

  const encounter_employee_presence = present_with_patient.find(
    matching({
      employee_id: organization_employment.employment_id,
    }),
  ) ?? null

  const patient_id = encounter.patient.id
  const open_encounter_pathname = `/app/organizations/${organization_id}/patients/${patient_id}/open_encounter`
  assert(ctx.url.pathname.includes(open_encounter_pathname))

  const encounter_props: OpenEncounterState = {
    ...ctx.state,
    encounter,
    patient_id,
    open_encounter_pathname,
    encounter_employee_presence,
    patient: encounter.patient,
    patient_encounter_id: encounter.patient_encounter_id,
    patient_age_determination: completedPersonal(encounter.patient) ? patientAgeDetermination(encounter.patient) : null,
  }

  Object.assign(ctx.state, encounter_props)

  // const response = await ctx.next()

  // // Run assertions to ensure any modifications to encounters
  // if (ctx.req.method === 'POST' && !get(ctx.state, 'encounter_expected_to_not_exist_after_post')) {
  //   await patient_encounters.getById(trx, encounter.patient_encounter_id)
  // }

  // return response
})

export function assertAllPriorStepsCompleted(
  ctx: OpenEncounterWorkflowContext,
  { attempting_to_complete_workflow }: {
    attempting_to_complete_workflow: boolean
  },
) {
  const { workflow, workflow_status } = ctx.state
  const workflow_steps = WORKFLOW_STEPS[workflow]
  const this_workflow_step_index = workflow_steps.indexOf(ctx.state.step)
  assert(this_workflow_step_index !== -1)

  const prior_workflow_steps = workflow_steps.slice(0, this_workflow_step_index)
  const steps_completed = new Set(workflow_status.steps_completed)

  const incomplete_step = prior_workflow_steps.find((step) => !steps_completed.has(step))

  if (!incomplete_step) return
  // const is_plural = incomplete_step.endsWith('s')
  // const pretty_name = is_plural
  //   ? incomplete_step
  //   : incomplete_step + ' information'
  const pretty_name = incomplete_step.replaceAll('_', ' ').replace(
    ' and ',
    ' & ',
  )
  const next_step = attempting_to_complete_workflow ? `completing ${words(workflow).join(' ')}` : 'continuing'
  const warning = encodeURIComponent(
    `Please fill out the ${pretty_name} form before ${next_step}.`,
  )
  const url = replaceParams(
    `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${incomplete_step}`,
    ctx.params,
  )
  assertOrRedirect(false, `${url}?warning=${warning}`)
}

export function OpenEncounterWorkflowLayoutCtx({ ctx, next_step_text, buttons, children }: {
  ctx: OpenEncounterWorkflowContext
  next_step_text?: string
  buttons?: ComponentChild
  children: ComponentChildren
}): JSX.Element {
  const id = last(ctx.route!.split('/'))!

  return (
    <OpenEncounterWorkflowLayout
      id={id}
      ContainerTag='form'
      next_step_text={next_step_text}
      buttons={buttons}
      priority={ctx.state.encounter.priority}
      nav_links={WORKFLOW_NAV_LINKS[ctx.state.workflow]}
      steps_completed={ctx.state.workflow_status.steps_completed}
      care_team={[]}
      sidebar_bottom={<HealthWorkerSidebarBottom employee={ctx.state.employee} />}
      current_workflow={ctx.state.workflow}
      {
        // care_team={ctx.state.patient.primary_doctor
        //   ? [{ ...ctx.state.patient.primary_doctor, role: 'doctor' }]
        //   : []}
        ...ctx
      }
      {...ctx.state}
    >
      {children}
    </OpenEncounterWorkflowLayout>
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
      <OpenEncounterWorkflowLayoutCtx
        ctx={ctx}
        next_step_text={next_step_text}
        buttons={buttons}
      >
        {children}
      </OpenEncounterWorkflowLayoutCtx>
    )
  }
}

export function WorkflowRedirectPage(
  ctx: OpenEncounterContext,
) {
  const workflow = last(ctx.route!.split('/'))
  assert(workflow)
  assert(isWorkflow(workflow))
  const workflow_status = getWorkflowStatus(ctx, workflow)
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
    const success_message = `${capitalize(workflow, { split_hyphen: true })} is complete. Continuing with ${
      capitalize(next_current_workflow, { split_hyphen: true })
    }`
    const next_route = `/app/organizations/${organization.id}/patients/${patient.id}/open_encounter/${next_current_workflow}/${
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
  const success_message = `${capitalize(workflow)} is complete. Please guide the patient to the waiting room to await ${
    capitalize(next_patient_presence.next_workflow, { split_hyphen: true })
  }`
  const next_route = `/app/organizations/${organization.id}/waiting_room?just_encountered_patient_id=${patient.id}`
  return success(success_message, next_route)
}

export function completedProcedure(
  ctx: OpenEncounterWorkflowContext,
) {
  const { workflow_step_snomed_concept, previously_completed_procedures } = ctx.state

  const previously_completed_procedure_record_id = workflow_step_snomed_concept
    ? previously_completed_procedures.workflow_step_record_id
    : previously_completed_procedures.workflow_record_id

  if (previously_completed_procedure_record_id) {
    return {
      procedure_id: previously_completed_procedure_record_id,
    }
  }
  return null
}

export function createProcedureIfNotAlreadyCompleted(
  ctx: OpenEncounterWorkflowContext,
) {
  const completed_procedure = completedProcedure(ctx)
  if (completed_procedure) return Promise.resolve(completed_procedure)

  const procedure_snomed_concept = ctx.state.workflow_step_snomed_concept ||
    ctx.state.workflow_snomed_concept

  return patient_procedures.insertOneNested(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    employment_id: ctx.state.encounter_employee_presence.employee_id,
    procedure: parseExpressionExpectingAtom(
      `(procedure ${PROCEDURE.s_expression} ${procedure_snomed_concept.s_expression})`,
      'procedure',
    ),
  })
}
