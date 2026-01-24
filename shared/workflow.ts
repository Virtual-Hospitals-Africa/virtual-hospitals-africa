import { assert } from 'std/assert/assert.ts'
import { Department, HealthWorkerOrganization, WorkflowStatus } from '../types.ts'
import last from '../util/last.ts'
import first from '../util/first.ts'
import { departmentNames, departmentResponsibleForWorkflow } from './departments.ts'
import capitalize from '../util/capitalize.ts'
import isKeyOf from '../util/isKeyOf.ts'
import mapEntries from '../util/mapEntries.ts'
import {
  BODY_MEASUREMENT,
  DISPENSING_MEDICATION,
  EMERGENCY_EXAMINATION_FOR_TRIAGE,
  ENCOUNTER_FOR_PROBLEM,
  EVALUATION_OF_CARE_PLAN,
  EVALUATION_PROCEDURE,
  HISTORY_TAKING_LIMITED,
  PATIENT_REGISTRATION,
  PRENATAL_EXAMINATION_AND_CARE_OF_MOTHER,
  REFERRAL_TO_ACCIDENT_AND_EMERGENCY_SERVICE,
  STABILIZATION,
  TAKING_PATIENT_VITAL_SIGNS_ASSESSMENT,
  TRIAGE,
} from './snomed_concepts.ts'

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

export const WORKFLOW_SNOMED_CONCEPTS = {
  registration: PATIENT_REGISTRATION,
  triage: TRIAGE,
  emergency_escalation: REFERRAL_TO_ACCIDENT_AND_EMERGENCY_SERVICE,
  stabilization: STABILIZATION,
  consultation: ENCOUNTER_FOR_PROBLEM,
  maternity: PRENATAL_EXAMINATION_AND_CARE_OF_MOTHER,
  prescription_refill: DISPENSING_MEDICATION,
  doctor_review: EVALUATION_OF_CARE_PLAN,
} satisfies {
  [w in Workflow]: unknown
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

export const WORKFLOW_STEP_SNOMED_CONCEPTS = {
  triage: {
    // The warning_sides code isn't quite right, but it's the closest match and having a single code per step streamlines things
    // TODO: become a member organization for SNOMED and request that all the codes we need be added
    // https://www.snomed.org/change-or-add
    // https://www.snomed.org/members
    'warning_signs': EMERGENCY_EXAMINATION_FOR_TRIAGE,
    'brief_history': HISTORY_TAKING_LIMITED,
    'height_and_weight': BODY_MEASUREMENT,
    'measure_vitals': TAKING_PATIENT_VITAL_SIGNS_ASSESSMENT,
    'additional_tasks_and_investigations': EVALUATION_PROCEDURE,
    // 'assign_priority': '',
  },
}

export const SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES: Record<string, string> = {}
for (const steps of Object.values(WORKFLOW_STEP_SNOMED_CONCEPTS)) {
  for (const [step, concept] of Object.entries(steps)) {
    SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES[concept.id] = step
  }
}

export function isWorkflow(workflow: string): workflow is Workflow {
  return workflow in WORKFLOW_STEPS
}

export function workflowStepKey(workflow: Workflow, step: string) {
  const workflow_steps: string[] = WORKFLOW_STEPS[workflow]
  assert(workflow_steps.includes(step))
  return `${workflow}:${step}`
}

export function workflowStepSnomedConcept(
  workflow: Workflow,
  step: string,
) {
  if (!isKeyOf(workflow, WORKFLOW_STEP_SNOMED_CONCEPTS)) return null
  const concepts = WORKFLOW_STEP_SNOMED_CONCEPTS[workflow]
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
): Department | undefined {
  return departmentNames(organization_employment).find((dept) => departmentResponsibleForWorkflow(dept, workflow))
}

export function prettyStepName(step: string) {
  return capitalize(step).replace(' And ', ' & ')
}

export const WORKFLOW_NAV_LINKS: {
  [w in Workflow]: {
    step: string
    route: string
    title: string
  }[]
} = mapEntries(WORKFLOW_STEPS, (steps, workflow) =>
  steps.map((step) => ({
    step,
    route: `/app/organizations/:organization_id/patients/:patient_id/open_encounter/${workflow}/${step}`,
    title: prettyStepName(step),
  })))
