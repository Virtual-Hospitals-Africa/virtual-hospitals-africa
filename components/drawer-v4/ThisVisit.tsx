import { hyphenate } from '../../util/hyphenate.ts'
import {
  RenderedEvaluationRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedSidebarWorkflow,
  RenderedSidebarWorkflowStep,
} from '../../types.ts'
import { Header } from './Header.tsx'
import { section_class_name } from './sectionClassName.ts'
import { WorkflowStep } from './WorkflowStep.tsx'
import { Workflow } from '../../db.d.ts'
import capitalize from '../../util/capitalize.ts'
import { NoFindings } from './NoFindings.tsx'
import { RecordChips } from './RecordChips.tsx'
import { prettyStepName } from '../../shared/workflow.ts'
import { RoutineRecordsSummary } from '../../islands/RoutineRecordsSummary.tsx'
import { pluralize } from '../../util/pluralize.ts'

function WorkflowHeading({ workflow }: { workflow: string }) {
  return (
    <h3 className="font-['Inter:Medium',sans-serif] font-medium leading-5 not-italic relative shrink-0 text-3.5 text-gray-600 capitalize">
      {capitalize(workflow)}
    </h3>
  )
}

type FindingRecord = RenderedSidebarWorkflowStep['records'][number]

function isFinding(record: FindingRecord): record is RenderedFindingRelativeToHealthWorker {
  return record.type === 'finding'
}

function isRoutine(record: FindingRecord): boolean {
  if (!isFinding(record)) return false
  const is_measurement = record.value?.type === 'measurement'
  if (is_measurement) return record.score === null || record.score === 0
  return record.score === 0
}

function RolledUpWorkflowSection(
  { workflow, organization_id }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
  },
) {
  const all_records = workflow.steps.flatMap((step) => step.records)

  if (all_records.length === 0) {
    return (
      <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
        <WorkflowHeading workflow={workflow.workflow} />
        <NoFindings explanation='No findings entered' with_padding_x />
      </section>
    )
  }

  const routine_measurements: FindingRecord[] = []
  const routine_assessments: FindingRecord[] = []
  const other_records: FindingRecord[] = []

  for (const record of all_records) {
    if (!isRoutine(record)) {
      other_records.push(record)
    } else if (isFinding(record) && record.value?.type === 'measurement') {
      routine_measurements.push(record)
    } else {
      routine_assessments.push(record)
    }
  }

  return (
    <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
      <WorkflowHeading workflow={workflow.workflow} />
      <div className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
        {routine_measurements.length > 0 && (
          <RoutineRecordsSummary
            label={`${routine_measurements.length} routine ${pluralize('measurement', routine_measurements.length)}`}
            records={routine_measurements}
            organization_id={organization_id}
          />
        )}
        {routine_assessments.length > 0 && (
          <RoutineRecordsSummary
            label={`${routine_assessments.length} routine ${pluralize('assessment', routine_assessments.length)}`}
            records={routine_assessments}
            organization_id={organization_id}
          />
        )}
        <RecordChips records={other_records} organization_id={organization_id} />
      </div>
    </section>
  )
}

function ExpandedWorkflowSection(
  { workflow, organization_id, show_heading }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
    show_heading: boolean
  },
) {
  return (
    <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
      {show_heading && <WorkflowHeading workflow={workflow.workflow} />}
      <div className='flex flex-col gap-2.5'>
        {workflow.steps.map((step) => <WorkflowStep key={step} workflow={workflow.workflow} step={step} organization_id={organization_id} />)}
      </div>
    </section>
  )
}

export function DrawerThisVisit(
  { organization_id, current_workflow, this_visit_findings, this_visit_diagnoses }: {
    organization_id: string
    current_workflow: Workflow
    this_visit_findings: RenderedSidebarWorkflow[]
    this_visit_diagnoses: RenderedEvaluationRelativeToHealthWorker[]
  },
) {
  const has_completed_workflows = this_visit_findings.some((w) => w.workflow !== current_workflow)

  return (
    <div id='patient-drawer-this-visit' className={section_class_name}>
      <Header>This Visit</Header>
      <div className='flex flex-col gap-2.5'>
        {this_visit_findings.map((workflow) =>
          workflow.workflow !== current_workflow
            ? <RolledUpWorkflowSection key={workflow.workflow} workflow={workflow} organization_id={organization_id} />
            : (
              <ExpandedWorkflowSection
                key={workflow.workflow}
                workflow={workflow}
                organization_id={organization_id}
                show_heading={has_completed_workflows}
              />
            )
        )}
        {!!this_visit_diagnoses.length && (
          <ExpandedWorkflowSection
            workflow={{
              workflow: 'Diagnoses' as unknown as Workflow,
              status: 'completed',
              steps: [{
                workflow_step: 'diagnoses',
                title: prettyStepName('diagnoses'),
                status: 'completed',
                records: this_visit_diagnoses,
              }],
            }}
            organization_id={organization_id}
            show_heading={false}
          />
        )}
      </div>
    </div>
  )
}
