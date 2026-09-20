import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { hyphenate } from '../../util/hyphenate.ts'
import {
  RecordedFinding,
  RenderedEvaluationRelativeToHealthWorker,
  RenderedFindingRelativeToHealthWorker,
  RenderedSidebarWorkflow,
  RenderedSidebarWorkflowStep,
} from '../../types.ts'
import { Header } from '../../components/drawer-v4/Header.tsx'
import { section_class_name } from '../../components/drawer-v4/sectionClassName.ts'
import { WorkflowStep } from '../../components/drawer-v4/WorkflowStep.tsx'
import { Workflow } from '../../db.d.ts'
import capitalize from '../../util/capitalize.ts'
import { NoFindings } from '../../components/drawer-v4/NoFindings.tsx'
import { RecordChips } from '../../components/drawer-v4/RecordChips.tsx'
import { recordChipClassName } from '../../components/drawer-v4/recordChipClassName.ts'
import { Spinner } from '../../components/library/Spinner.tsx'
import { prettyStepName } from '../../shared/workflow.ts'
import { RoutineRecordsSummary } from '../RoutineRecordsSummary.tsx'
import { pluralize } from '../../util/pluralize.ts'
import { addFindingEventListener } from '../../shared/finding_events.ts'

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

// A finding being recorded on this page, shown in the colour of its priority until its record arrives
function SavingChip({ finding }: { finding: RecordedFinding }) {
  return (
    <span
      id={`saving-chip-${hyphenate(finding.entered.display)}`}
      className={recordChipClassName({ priority: finding.entered.priority })}
    >
      <Spinner className='size-3' aria-hidden='true' />
      Saving ({finding.entered.display})
    </span>
  )
}

function ExpandedWorkflowSection(
  { workflow, organization_id, show_heading, current_step, pending }: {
    workflow: RenderedSidebarWorkflow
    organization_id: string
    show_heading: boolean
    current_step: string | null
    pending: RecordedFinding[]
  },
) {
  return (
    <section id={`patient-drawer-workflow-section-${hyphenate(workflow.workflow)}`}>
      {show_heading && <WorkflowHeading workflow={workflow.workflow} />}
      <div className='flex flex-col gap-2.5'>
        {workflow.steps.map((step) => (
          <WorkflowStep
            key={step.workflow_step}
            workflow={workflow.workflow}
            step={step}
            organization_id={organization_id}
            after={step.workflow_step === current_step && pending.length > 0 && (
              <div className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
                {pending.map((finding) => <SavingChip key={finding.record_id} finding={finding} />)}
              </div>
            )}
          />
        ))}
      </div>
    </section>
  )
}

/*
  Findings recorded on this page appear under the step being worked on as they are saved,
  first as a "Saving" chip and then as the record itself, which the finding recorder learns
  from the clinical_finding route (shared/finding_events.ts). Records removed on this page
  disappear. Nothing else in the drawer changes until the page is next loaded.
*/
export default function DrawerThisVisit(
  { organization_id, current_workflow, current_step, this_visit_findings, this_visit_diagnoses }: {
    organization_id: string
    current_workflow: Workflow
    current_step: string | null
    this_visit_findings: RenderedSidebarWorkflow[]
    this_visit_diagnoses: RenderedEvaluationRelativeToHealthWorker[]
  },
) {
  const pending = useSignal<RecordedFinding[]>([])
  const added = useSignal<RenderedFindingRelativeToHealthWorker[]>([])
  const removed_ids = useSignal<Set<string>>(new Set())

  useEffect(() => {
    const removers = [
      addFindingEventListener('finding:entered', (finding) => {
        pending.value = [...pending.value.filter((p) => p.key !== finding.key), finding]
      }),
      addFindingEventListener('finding:recorded', ({ record }) => {
        pending.value = pending.value.filter((p) => p.record_id !== record.id)
        added.value = [...added.value.filter((r) => r.id !== record.id), record]
      }),
      addFindingEventListener('finding:save-failed', ({ record_id }) => {
        pending.value = pending.value.filter((p) => p.record_id !== record_id)
      }),
      addFindingEventListener('finding:removed', ({ record_id }) => {
        removed_ids.value = new Set([...removed_ids.value, record_id])
      }),
      addFindingEventListener('finding:remove-failed', ({ recorded }) => {
        const next = new Set(removed_ids.value)
        next.delete(recorded.record_id)
        removed_ids.value = next
      }),
    ]
    return () => removers.forEach((remove) => remove())
  }, [])

  const has_completed_workflows = this_visit_findings.some((w) => w.workflow !== current_workflow)

  // The current step's records as they stand now: those rendered less those removed, plus those recorded since
  function liveSteps(workflow: RenderedSidebarWorkflow): RenderedSidebarWorkflow {
    if (workflow.workflow !== current_workflow) return workflow
    return {
      ...workflow,
      steps: workflow.steps.map((step) => {
        if (step.workflow_step !== current_step) return step
        const kept = step.records.filter((record) => !removed_ids.value.has(record.id))
        const kept_ids = new Set(kept.map((record) => record.id))
        const new_records = added.value.filter((record) => !removed_ids.value.has(record.id) && !kept_ids.has(record.id))
        return { ...step, records: [...kept, ...new_records] }
      }),
    }
  }

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
                workflow={liveSteps(workflow)}
                organization_id={organization_id}
                show_heading={has_completed_workflows}
                current_step={current_step}
                pending={pending.value}
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
            current_step={null}
            pending={[]}
          />
        )}
      </div>
    </div>
  )
}
