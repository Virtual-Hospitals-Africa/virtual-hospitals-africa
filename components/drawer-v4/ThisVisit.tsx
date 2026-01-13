import { RenderedSidebarWorkflow, RenderedSidebarWorkflowStep } from '../../types.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { RecordChips } from './RecordChip.tsx'
import { NoFindings } from './NoFindings.tsx'
import { hyphenate } from '../../util/hyphenate.ts'
import { Workflow } from '../../db.d.ts'

function WorkflowStep(
  { workflow, step, organization_id }: {
    workflow: Workflow
    step: RenderedSidebarWorkflowStep
    organization_id: string
  },
) {
  return (
    <div
      id={`patient-drawer-workflow-step-${hyphenate(workflow)}-${hyphenate(step.workflow_step)}`}
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
      {step.status !== 'in progress' && arrayIsEmpty(step.records) && <NoFindings explanation='No findings entered' with_padding_x />}
      <RecordChips
        records={step.records}
        organization_id={organization_id}
      />
    </div>
  )
}

function WorkflowSection(
  { workflow, organization_id }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
  },
) {
  return (
    <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
      {/* <h3 className='capitalize'>{workflow.workflow}</h3> */}
      <div className='flex flex-col gap-2.5'>
        {workflow.steps.map((step) => <WorkflowStep key={step} workflow={workflow.workflow} step={step} organization_id={organization_id} />)}
      </div>
    </section>
  )
}

export function DrawerThisVisit(
  { organization_id, this_visit_findings }: {
    organization_id: string
    this_visit_findings: RenderedSidebarWorkflow[]
  },
) {
  return (
    <div id='patient-drawer-this-visit' className='bg-white content-stretch flex flex-col items-start justify-start relative shrink-0 px-3 w-full'>
      <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-5.5 not-italic relative shrink-0 text-[#29313d] text-[16px] text-nowrap whitespace-pre z-2 pb-1">
        This Visit
      </h2>
      {this_visit_findings.map((workflow) => <WorkflowSection key={workflow.workflow} workflow={workflow} organization_id={organization_id} />)}
    </div>
  )
}
