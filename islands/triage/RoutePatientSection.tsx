import { Maybe, Names, Priority, RenderedEmployeeWithPresence } from '../../types.ts'
import { EncounterReason } from '../../db.d.ts'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'
import compact from '../../util/compact.ts'
import FormRow from '../../components/library/FormRow.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { RadioButtonGroup } from '../../components/library/RadioButtonGroup.tsx'
import { computed, useSignal } from '@preact/signals'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { InviteParticipantsFormFields } from '../InviteParticipantsList.tsx'
import capitalize from '../../util/capitalize.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { assertUnreachable } from '../../util/assertUnreachable.ts'
import { organizationOf } from '../../shared/employees.ts'
import assertOneOf from '../../util/assertOneOf.ts'
import { TriageRoutePatientNextStep, TRIAGE_ROUTE_PATIENT_NEXT_STEPS } from '../../shared/triage_route_patient.ts'
import { NextStepSelect } from '../../components/library/NextStepSelect.tsx'

// function NextStepSelect(
//   { patient_names, default_next_step, priority, to_be_notified, onSelect }: {
//     patient_names: Names
//     default_next_step: TriageRoutePatientNextStep
//     priority: {
//       name: Priority
//       target_treatment_time: Date | null
//     }
//     to_be_notified: string[]
//     onSelect(next_step: TriageRoutePatientNextStep): void
//   },
// ) {
//   const staff = new Intl.ListFormat('en').format(to_be_notified) || 'staff'

//   return (
//     <RadioButtonGroup
//       name='next_step'
//       defaultValue={default_next_step}
//       onInput={(event) => {
//         assertOneOf(event.currentTarget.value, TRIAGE_ROUTE_PATIENT_NEXT_STEPS)
//         onSelect(event.currentTarget.value)
//       }}
//       options={[
//         {
//           id: 'await_consultation' satisfies TriageRoutePatientNextStep,
//           name: 'Await consultation',
//           description: compact([
//             `I will show ${patient_names.preferred_name} to the waiting room.`,
//             `Their case will be prioritized based on their having a ${priority.name.toLowerCase()} case.`,
//             priority.target_treatment_time &&
//             `Target treatment time: ${new Date(priority.target_treatment_time).toLocaleTimeString('en', { hour: 'numeric', minute: 'numeric' })}`,
//           ]),
//         },
//         {
//           id: 'refer_case' satisfies TriageRoutePatientNextStep,
//           name: 'Refer case',
//           description: compact([
//             `I will stay here with ${patient_names.preferred_name}.`,
//             `${capitalize(staff)} will be notified immediately about their case and location.`,
//             default_next_step === 'refer_case' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
//           ]),
//         },
//         {
//           id: 'stabilize_patient' satisfies TriageRoutePatientNextStep,
//           name: 'Stabilize patient',
//           description: compact([
//             `I will transfer ${patient_names.preferred_name} to the stabilization area.`,
//             `${capitalize(staff)} will be notified immediately to meet us there.`,
//             default_next_step === 'stabilize_patient' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
//           ]),
//         },
//         {
//           id: 'come_back_later' satisfies TriageRoutePatientNextStep,
//           name: 'Come back later',
//           description: compact([
//             `${capitalize(staff)} will be notified with my message.`,
//             `${patient_names.preferred_name} will stay here.`,
//             `I will serve other patients and come back once ${staff} ${to_be_notified.length === 1 ? 'has' : 'have'} responded.`,
//           ]),
//         },
//         // {
//         //   id: 'send_message',
//         //   name: '',
//         //   description: [
//         //     `I will stay here in reception with ${patient_names.preferred_name}`,
//         //     `${to_be_notified} will be notified immediately to join us in reception`,
//         //   ],
//         // },
//       ]}
//     />
//   )
// }

function defaultNextStep(priority: Priority): TriageRoutePatientNextStep {
  switch (priority) {
    case 'Non-urgent':
      return 'await_consultation'
    case 'Urgent':
    case 'Deceased':
      return 'refer_case'
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

function defaultToBeNotified(next_step: TriageRoutePatientNextStep, clinic_employees: RenderedEmployeeWithPresence[]): Set<RenderedEmployeeWithPresence> {
  switch (next_step) {
    case 'await_consultation':
      return new Set()
    case 'refer_case':
    case 'stabilize_patient': {
      const shcp = getSHCP(clinic_employees)
      return new Set(shcp ? [shcp] : [])
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
  { this_visit, patient_names, priority, clinic_employees }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
    patient_names: Names
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    clinic_employees: RenderedEmployeeWithPresence[]
  },
) {
  const default_next_step = defaultNextStep(priority.name)
  const next_step = useSignal<string>(default_next_step)
  const to_be_notified = useSignal<Set<RenderedEmployeeWithPresence>>(defaultToBeNotified(default_next_step, clinic_employees))
  const to_be_notified_display = computed(() => [...to_be_notified.value].map(employeeDisplay).map((e) => e.display_name))

  return (
    <>
      <FormSection header='Next Step'>
        <FormRow>
          <NextStepSelect
            patient_names={patient_names}
            priority={priority}
            default_next_step={default_next_step}
            to_be_notified={to_be_notified_display.value}
            onSelect={(step) => next_step.value = step}
          />
        </FormRow>
        <FormRow>
          <InviteParticipantsFormFields
            facility_employees={clinic_employees}
            // Triage nurses do not invite hospital employees
            hospital_employees={[]}
            selected={to_be_notified}
          />
        </FormRow>
        <FormRow>
          <TextArea
            name='notes'
            label='Additional notes'
            value={this_visit.notes}
          />
        </FormRow>
        <HiddenInput
          name='health_worker_ids_to_be_notified'
          value={[...to_be_notified.value].map((x) => x.id)}
        />
      </FormSection>
    </>
  )
}
