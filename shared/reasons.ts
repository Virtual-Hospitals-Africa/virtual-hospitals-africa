import { EncounterReason } from '../db.d.ts'
import { Workflow } from './workflow.ts'

export const ENCOUNTER_REASONS: EncounterReason[] = [
  'seeking treatment',
  'maternity',
  'follow up',
  'referral',
  'checkup',
  'administration',
]

const REASON_WORKFLOW_MAP: Partial<Record<EncounterReason, Workflow>> = {
  'seeking treatment': 'seeking_treatment',
  'maternity': 'maternity',
}

export function reasonToWorkflow(reason: EncounterReason): Workflow {
  return REASON_WORKFLOW_MAP[reason] || 'seeking_treatment'
}
