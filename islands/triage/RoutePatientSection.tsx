import { Maybe, Names, Priority, RenderedEmployeeWithPresence } from '../../types.ts'
import { EncounterReason } from '../../db.d.ts'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import FormSection from '../../components/library/FormSection.tsx'

import { computed, useSignal } from '@preact/signals'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { assertUnreachable } from '../../util/assertUnreachable.ts'
import { organizationOf } from '../../shared/employees.ts'
import { TriageRoutePatientNextStep } from '../../shared/triage_route_patient.ts'
import { NextStepSelect } from '../../components/library/NextStepSelect.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'

function defaultNextStep(priority: Priority): TriageRoutePatientNextStep {
  switch (priority) {
    case 'Non-urgent':
      return 'await_consultation'
    case 'Urgent':
    case 'Deceased':
      return 'hand_over'
    case 'Very urgent':
    case 'Emergency':
      return 'stabilize_patient'
    default:
      return assertUnreachable(priority)
  }
}

function getSHCP(clinic_employees: RenderedEmployeeWithPresence[]) {
  return clinic_employees.find((employee) => organizationOf(employee).in_departments.some((department) => department.name === 'Primary care'))
}

function defaultToBeNotified(next_step: TriageRoutePatientNextStep, clinic_employees: RenderedEmployeeWithPresence[]): RenderedEmployeeWithPresence[] {
  switch (next_step) {
    case 'await_consultation':
      return []
    case 'hand_over':
    case 'stabilize_patient': {
      const shcp = getSHCP(clinic_employees)
      return shcp ? [shcp] : []
    }
    case 'come_back_later': {
      throw new Error('come_back_later is never a default step')
    }
    default: {
      return assertUnreachable(next_step)
    }
  }
}

export default function TriageRoutePatientSection(
  { this_visit, patient, priority, clinic_employees }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
    patient: {
      names: Names
      gender: string | null
    }
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    clinic_employees: RenderedEmployeeWithPresence[]
  },
) {
  const default_next_step = defaultNextStep(priority.name)
  const next_step = useSignal<string>(default_next_step)
  const to_be_notified = useSignal<RenderedEmployeeWithPresence[]>(defaultToBeNotified(default_next_step, clinic_employees))
  const to_be_notified_display = computed(() => [...to_be_notified.value].map(employeeDisplay).map((e) => e.display_name))

  return (
    <>
      <FormSection id='route_patient_next_step' header='Next Step'>
        <FormRow>
          <NextStepSelect
            patient={patient}
            priority={priority}
            default_next_step={default_next_step}
            to_be_notified={to_be_notified_display.value}
            onSelect={(step) => next_step.value = step}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Staff'>
        <FormRow>
          <ProvidersSelect
            providers={clinic_employees}
            initialSelected={to_be_notified.value}
            onChange={(employees) => to_be_notified.value = employees}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Notes'>
        <FormRow>
          <TextArea
            name='notes'
            label={null}
            value={this_visit.notes}
          />
        </FormRow>
      </FormSection>
      <HiddenInput
        name='health_worker_ids_to_be_notified'
        value={[...to_be_notified.value].map((x) => x.id)}
      />
    </>
  )
}
