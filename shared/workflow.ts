import { assert } from 'std/assert/assert.ts'
import { WorkflowStatus } from '../types.ts'
import last from '../util/last.ts'
import first from '../util/first.ts'

export const WORKFLOWS = [
  'registration' as const,
  'triage' as const,
  'seeking_treatment' as const,
  'maternity' as const,
  'prescription_refill' as const,
  'doctor_review' as const,
  'resuscitation' as const,
]

export type Workflow = (typeof WORKFLOWS)[number]

export const WORKFLOW_SNOMED_CONCEPT_IDS = {
  registration: '184047000', // Patient registration
  triage: '225390008',
  seeking_treatment: '185347001', // Encounter for problem
  maternity: '18114009', //  |Prenatal examination and care of mother (procedure)|
  prescription_refill: '373784005', //  |Dispensing medication (procedure)|
  doctor_review: '712744002', //  |Evaluation of care plan (procedure)|
  resuscitation: '439569004',
}

export const WORKFLOW_STEPS = {
  registration: [
    'personal',
    'this_visit',
    'primary_care',
    'contacts',
    'biometrics',
    'confirm',
  ],
  triage: [
    'warning_signs', // chief complaint + emergency signs + urgent signs
    'measure_vitals',
    'additional_investigations',
    'assign_priority',
  ],
  seeking_treatment: [
    'chief_complaint',
    'vitals',
    'symptoms',
    'history',
    'general_assessments',
    'examinations',
    'diagnostic_tests',
    'diagnoses',
    'prescriptions',
    'orders',
    'clinical_notes',
    'request_review',
    'close_visit',
  ],
  maternity: [
    'checkup',
  ],
  prescription_refill: [
    'dispense',
  ],
  doctor_review: [
    'clinical_notes',
    'diagnosis',
    'prescriptions',
    'orders',
    'referral',
    'revert',
  ],
  resuscitation: [
    'stabilize',
  ],
}

export function isWorkflow(workflow: string): workflow is Workflow {
  return workflow in WORKFLOW_STEPS
}

export function workflowStepKey(workflow: Workflow, step: string) {
  const workflow_steps: string[] = WORKFLOW_STEPS[workflow]
  assert(workflow_steps.includes(step))
  return `${workflow}:${step}`
}

export function firstIncompleteStep(
  workflow: Workflow,
  steps_completed: string[],
): string | undefined {
  const workflow_steps: string[] = WORKFLOW_STEPS[workflow]
  return workflow_steps.find((step) => !steps_completed.includes(step))
}

export function firstIncompleteStepStatus(
  workflow_status: WorkflowStatus,
): string | undefined {
  return firstIncompleteStep(
    workflow_status.workflow,
    workflow_status.steps_completed,
  )
}

export function firstStep(workflow: Workflow): string {
  const first_step = first(WORKFLOW_STEPS[workflow])
  assert(first_step)
  return first_step
}

export function lastStep(workflow: Workflow): string {
  const last_step = last(WORKFLOW_STEPS[workflow])
  assert(last_step)
  return last_step
}
