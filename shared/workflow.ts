import { assert } from 'std/assert/assert.ts'
import { HealthWorkerOrganization, WorkflowStatus } from '../types.ts'
import last from '../util/last.ts'
import first from '../util/first.ts'
import { departmentNames, departmentResponsibleForWorkflow } from './departments.ts'
import capitalize from '../util/capitalize.ts'
import values from '../util/values.ts'
import { invertRecord } from '../util/invertRecord.ts'
import { combineAll } from '../util/combine.ts'
import isKeyOf from '../util/isKeyOf.ts'

export const WORKFLOWS = [
  'registration' as const,
  'triage' as const,
  'emergency_escalation' as const,
  'stabilization' as const,
  'consultation' as const,
  'maternity' as const,
  'prescription_refill' as const,
  'doctor_review' as const,
  // 'resuscitation' as const,
]

export type Workflow = (typeof WORKFLOWS)[number]

export const WORKFLOW_SNOMED_CONCEPT_IDS = {
  registration: '184047000', // Patient registration
  triage: '225390008',
  emergency_escalation: '306104004', // |Referral to accident and emergency service (procedure)|
  stabilization: '115979005', // |Stabilization (procedure)|
  consultation: '185347001', // Encounter for problem
  maternity: '18114009', //  |Prenatal examination and care of mother (procedure)|
  prescription_refill: '373784005', //  |Dispensing medication (procedure)|
  doctor_review: '712744002', //  |Evaluation of care plan (procedure)|
  // resuscitation: '439569004',
} satisfies {
  [w in Workflow]: string
}

export const WORKFLOW_STEPS = {
  registration: [
    'personal',
    'this_visit',
    'primary_care',
    'contacts',
    'confirm_details',
    'terms_and_conditions',
    'route_patient',
  ],
  triage: [
    'warning_signs', // chief complaint + emergency signs + urgent signs
    'brief_history',
    'height_and_weight',
    'measure_vitals',
    'additional_tasks_and_investigations',
    'assign_priority',
    'route_patient',
  ],
  emergency_escalation: [
    'identify_patient',
    'emergency_reason',
    'notify_staff',
  ],
  stabilization: [
    'monitor_patient',
  ],
  consultation: [
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
  // resuscitation: [
  //   'stabilize',
  // ],
} satisfies {
  [w in Workflow]: string[]
}

export const WORKFLOW_STEP_SNOMED_CONCEPT_IDS = {
  triage: {
    // The warning_sides code isn't quite right, but it's the closest match and having a single code per step streamlines things
    // TODO: become a member organization for SNOMED and request that all the codes we need be added
    // https://www.snomed.org/change-or-add
    // https://www.snomed.org/members
    'warning_signs': '245581009', // chief complaint + emergency signs + urgent signs |Emergency examination for triage (procedure)|
    'brief_history': '203421005', // |History taking, limited (procedure)|'
    'height_and_weight': '54709006', // |Body measurement (procedure)|'
    'measure_vitals': '410188000', // |Taking patient vital signs assessment (procedure)|
    'additional_tasks_and_investigations': '386053000', // Evaluation procedure (procedure)
    // 'assign_priority': '',
  },
}

export const SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES = invertRecord(combineAll(values(WORKFLOW_STEP_SNOMED_CONCEPT_IDS)))

export function isWorkflow(workflow: string): workflow is Workflow {
  return workflow in WORKFLOW_STEPS
}

export function workflowStepKey(workflow: Workflow, step: string) {
  const workflow_steps: string[] = WORKFLOW_STEPS[workflow]
  assert(workflow_steps.includes(step))
  return `${workflow}:${step}`
}

export function workflowStepSnomedConceptId(
  workflow: Workflow,
  step: string,
): string | null {
  if (!isKeyOf(workflow, WORKFLOW_STEP_SNOMED_CONCEPT_IDS)) return null
  const concepts = WORKFLOW_STEP_SNOMED_CONCEPT_IDS[workflow]
  return isKeyOf(step, concepts) ? concepts[step] : null
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

export function canPerform(
  organization_employment: HealthWorkerOrganization,
  workflow: Workflow,
): boolean {
  return departmentNames(organization_employment).some((dept) => departmentResponsibleForWorkflow(dept, workflow))
}

export function prettyStepName(step: string) {
  return capitalize(step).replace(' And ', ' & ')
}
