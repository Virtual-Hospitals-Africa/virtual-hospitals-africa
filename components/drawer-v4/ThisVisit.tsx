import { assert } from 'std/assert/assert.ts'
import { Workflow } from '../../db.d.ts'
import { prettyStepName, WORKFLOW_STEP_SNOMED_CONCEPT_IDS, WORKFLOW_STEPS, WORKFLOWS } from '../../shared/workflow.ts'
import { PatientDrawerV4Props, RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { arrayIsNonEmpty } from '../../util/arraySize.ts'
import compact from '../../util/compact.ts'
import { groupBy } from '../../util/groupBy.ts'
import { RecordChips } from '../../islands/RecordChip.tsx'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

type DrawerThisVisitProps = Pick<
  PatientDrawerV4Props,
  | 'this_visit_findings'
  | 'encounter'
  | 'current_workflow_state'
  | 'organization_id'
>

type RenderedSidebarWorkflowStep = {
  workflow_step: string
  title: string
  status: 'not started' | 'in progress' | 'completed'
  records: RenderedFindingRelativeToHealthWorker[]
}

type RenderedSidebarWorkflow = {
  workflow: Workflow
  status: 'not started' | 'incomplete' | 'in progress' | 'completed'
  steps: RenderedSidebarWorkflowStep[]
}

// TODO: move to models?
function groupRecordsByWorkflows(
  { this_visit_findings, encounter, current_workflow_state }: DrawerThisVisitProps,
): RenderedSidebarWorkflow[] {
  const records_by_procedure = groupBy(
    this_visit_findings,
    (record) => record.as_part_of_procedure.specific_snomed_concept.snomed_concept_id,
  )

  const grouped_records = compact(WORKFLOWS.map((workflow) => {
    const workflow_status = encounter.workflows[workflow]
    if (!workflow_status) return null
    if (workflow === 'registration') return null

    const workflow_steps = WORKFLOW_STEPS[workflow]

    return {
      workflow,
      status: workflow_status.status,
      steps: workflow_steps.map((workflow_step) => {
        const workflow_step_snomed_concept_id = WORKFLOW_STEP_SNOMED_CONCEPT_IDS[workflow]?.[workflow_step]

        const records_of_concept = (workflow_step_snomed_concept_id &&
          records_by_procedure.get(workflow_step_snomed_concept_id)) || []

        const completed = arrayIsNonEmpty(workflow_status.steps_completed) ? workflow_status.steps_completed.includes(workflow_step) : false

        const in_progress = current_workflow_state?.workflow === workflow &&
          current_workflow_state?.step === workflow_step

        return {
          workflow_step,
          title: prettyStepName(workflow_step),
          status: completed ? 'completed' as const : in_progress ? 'in progress' as const : 'not started' as const,
          records: records_of_concept,
        }
      }).filter((step) => step.status !== 'not started'),
    }
  }))

  const remaining_records = new Set(this_visit_findings)
  for (const workflow of grouped_records) {
    for (const step of workflow.steps) {
      for (const record of step.records) {
        remaining_records.delete(record)
      }
    }
  }

  assert(
    !remaining_records.size,
    `Expected all records to be accounted for\n${humanReadableJson(Array.from(remaining_records))}`,
  )

  return grouped_records
}

function WorkflowStep(
  { step, organization_id }: {
    step: RenderedSidebarWorkflowStep
    organization_id: string
  },
) {
  return (
    <div
      key={step.workflow_step}
      className='box-border content-stretch flex flex-col gap-1 items-start justify-start relative shrink-0 w-full'
    >
      <div className='content-stretch flex gap-2 items-center justify-center relative shrink-0'>
        <p
          className={`font-['Inter:Medium',sans-serif] font-medium leading-5 not-italic relative shrink-0 text-[14px] text-nowrap whitespace-pre ${
            step.status === 'completed' ? 'text-gray-600' : 'text-[#959ca9]'
          }`}
        >
          {step.title}
        </p>
        {step.status === 'in progress' && (
          <p className="font-['Inter:Medium_Italic',sans-serif] font-medium italic leading-4 relative shrink-0 text-[#959ca9] text-[12px] text-nowrap whitespace-pre">
            In Progress
          </p>
        )}
      </div>
      <RecordChips
        records={step.records}
        organization_id={organization_id}
      />
    </div>
  )
}

function WorkflowX(
  { workflow, organization_id }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
  },
) {
  return (
    <div>
      {/* <h3 className='capitalize'>{workflow.workflow}</h3> */}
      <div className='flex flex-col gap-2.5'>
        {workflow.steps.map((step) => <WorkflowStep key={step} step={step} organization_id={organization_id} />)}
      </div>
    </div>
  )
}

// This Visit component showing encounter steps
export function DrawerThisVisit(
  { this_visit_findings, encounter, current_workflow_state, organization_id }: DrawerThisVisitProps,
) {
  const grouped_records = groupRecordsByWorkflows({
    this_visit_findings,
    encounter,
    current_workflow_state,
    organization_id,
  })

  return (
    <div id='patient-drawer-this-visit' className='bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 px-3 w-full'>
      <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-5.5 not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-2 pb-1">
        This Visit
      </h2>
      {grouped_records.map((workflow) => <WorkflowX key={workflow.workflow} workflow={workflow} organization_id={organization_id} />)}
    </div>
  )
}
