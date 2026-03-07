import { Signal, useSignal } from '@preact/signals'
import { RenderedEmployeeWithPresence, RenderedPatientOpenEncounter } from '../types.ts'
import { AvailabilityInfo, ProviderSelectOption } from './ProvidersSelect.tsx'
import { BadgeColor } from '../components/library/Badge.tsx'
import { Workflow } from '../db.d.ts'

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

function priorityBadge(priority: string | null): { content: string; color: BadgeColor } {
  if (!priority) return { content: 'Undetermined', color: 'gray' }
  switch (priority) {
    case 'Non-urgent':
      return { content: 'Non-urgent', color: 'green' }
    case 'Urgent':
      return { content: 'Urgent', color: 'yellow' }
    case 'Very urgent':
      return { content: 'Very urgent', color: 'yellow' }
    case 'Emergency':
      return { content: 'Emergency', color: 'red' }
    default:
      return { content: priority, color: 'gray' }
  }
}

function getEncounterLabel(encounter: RenderedPatientOpenEncounter): string {
  const entries = Object.entries(encounter.workflows) as [Workflow, { status: string }][]
  const active = entries.find(([, s]) => s.status === 'in progress') ??
    entries.find(([, s]) => s.status === 'incomplete') ??
    entries.find(([, s]) => s.status === 'not started')
  if (active) return WORKFLOW_LABELS[active[0]] ?? `In ${active[0]}`
  return 'In encounter'
}

function computeAvailability(employee: RenderedEmployeeWithPresence): AvailabilityInfo | undefined {
  if (employee.open_encounter) {
    return {
      label: getEncounterLabel(employee.open_encounter),
      badge: priorityBadge(employee.open_encounter.priority?.name ?? null),
    }
  }
  if (employee.at_work) {
    return { label: 'TODO' }
  }
}

export function InviteParticipantsFormFields({
  facility_employees,
  hospital_employees,
  selected,
}: {
  facility_employees: RenderedEmployeeWithPresence[]
  hospital_employees: RenderedEmployeeWithPresence[]
  selected: Signal<Set<RenderedEmployeeWithPresence>>
}) {
  const all_employees = [...facility_employees, ...hospital_employees]

  return (
    <div className='space-y-6'>
      {facility_employees.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            Your Facility
          </h2>
          <fieldset className='grid grid-cols-1 gap-2'>
            {facility_employees.map((employee) => (
              <ProviderSelectOption
                key={employee.employee_id}
                provider={employee}
                selected={selected.value.has(employee)}
                availability={computeAvailability(employee)}
                toggleSelection={() => {
                  const new_selected = new Set(selected.value)
                  if (selected.value.has(employee)) {
                    new_selected.delete(employee)
                  } else {
                    new_selected.add(employee)
                  }
                  selected.value = new_selected
                }}
              />
            ))}
          </fieldset>
        </div>
      )}

      {hospital_employees.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-3'>
            Nearest Hospital
          </h2>
          <fieldset className='grid grid-cols-1 gap-2'>
            {hospital_employees.map((employee) => (
              <ProviderSelectOption
                key={employee.employee_id}
                provider={employee}
                selected={selected.value.has(employee)}
                availability={computeAvailability(employee)}
                toggleSelection={() => {
                  const new_selected = new Set(selected.value)
                  if (selected.value.has(employee)) {
                    new_selected.delete(employee)
                  } else {
                    new_selected.add(employee)
                  }
                  selected.value = new_selected
                }}
              />
            ))}
          </fieldset>
        </div>
      )}

      {all_employees.length === 0 && (
        <p className='text-gray-500 text-center py-8'>
          No health workers available at this time.
        </p>
      )}
    </div>
  )
}

export default function InviteParticipantsList(props: {
  facility_employees: RenderedEmployeeWithPresence[]
  hospital_employees: RenderedEmployeeWithPresence[]
}) {
  const selected = useSignal<Set<RenderedEmployeeWithPresence>>(new Set())

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>
        Invite Participants to Consultation
      </h1>

      <InviteParticipantsFormFields {...props} selected={selected} />
      {selected.value.size > 0 && (
        <input
          type='hidden'
          name='participant_emails'
          value={JSON.stringify([...selected.value].map((p) => p.email))}
        />
      )}
    </div>
  )
}
