import { SqlBool } from 'kysely'
import { Workflow } from '../db.d.ts'
import { AvailabilityInfo } from '../islands/ProvidersSelect.tsx'
import { Maybe, RenderedEmployee, RenderedPatientOpenEncounter } from '../types.ts'
import PriorityBadge from './PriorityBadge.tsx'

const WORKFLOW_LABELS: Partial<Record<Workflow, string>> = {
  consultation: 'In consultation',
  triage: 'In triage',
  registration: 'In registration',
  doctor_review: 'In doctor review',
  emergency_escalation: 'In emergency escalation',
  maternity: 'In maternity',
  prescription_refill: 'In prescription refill',
  stabilization: 'In stabilization',
  create_google_meet: 'In Google Meet',
}

function getEncounterLabel(encounter: RenderedPatientOpenEncounter): string {
  const entries = Object.entries(encounter.workflows) as [Workflow, { status: string }][]
  const active = entries.find(([, s]) => s.status === 'in progress') ??
    entries.find(([, s]) => s.status === 'incomplete') ??
    entries.find(([, s]) => s.status === 'not started')
  if (active) return WORKFLOW_LABELS[active[0]] ?? `In ${active[0]}`
  return 'In encounter'
}

function computeAvailability(
  employee: RenderedEmployee & {
    at_work?: SqlBool
    open_encounter?: Maybe<RenderedPatientOpenEncounter>
  },
): AvailabilityInfo {
  if (employee.open_encounter) {
    return {
      label: getEncounterLabel(employee.open_encounter),
      priority: employee.open_encounter.priority?.name ?? null,
    }
  }
  if (employee.at_work) {
    return { label: 'TODO' }
  }
  return { label: 'Not at work at present' }
}

export function HealthWorkerPresence({ employee }: {
  employee: RenderedEmployee & {
    at_work?: SqlBool
    open_encounter?: Maybe<RenderedPatientOpenEncounter>
  }
}) {
  const availability = computeAvailability(employee)
  return (
    <span className='flex flex-col items-start gap-1 mt-2 sm:mt-0 sm:items-end'>
      <span className='text-xs text-gray-600'>{availability.label}</span>
      {availability.priority !== undefined && <PriorityBadge priority={availability.priority} />}
    </span>
  )
}
