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

function NextStepSelect(
  { patient_names, priority, to_be_notified }: {
    patient_names: Names
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    to_be_notified: string[]
  },
) {
  const staff = new Intl.ListFormat('en').format(to_be_notified) || 'staff'
  const default_value = priority.name === 'Non-urgent' ? 'await_consultation' : priority.name === 'Urgent' ? 'refer_case' : 'transfer_to_stabilization_area'

  return (
    <RadioButtonGroup
      name='next_workflow'
      defaultValue={default_value}
      options={[
        {
          id: 'await_consultation',
          name: 'Await consultation with primary care',
          description: compact([
            `I will show ${patient_names.preferred_name} to the waiting room.`,
            `Their case will be prioritized based on their having a ${priority.name.toLowerCase()} case.`,
            priority.target_treatment_time &&
            `Target treatment time: ${new Date(priority.target_treatment_time).toLocaleTimeString('en', { hour: 'numeric', minute: 'numeric' })}`,
          ]),
        },
        {
          id: 'refer_case',
          name: 'Refer case',
          description: compact([
            `I will stay here with ${patient_names.preferred_name}.`,
            `${capitalize(staff)} will be notified immediately about their case and location.`,
            default_value === 'refer_case' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
          ]),
        },
        {
          id: 'transfer_to_stabilization_area',
          name: 'Stabilize patient',
          description: compact([
            `I will transfer ${patient_names.preferred_name} to the stabilization area.`,
            `${capitalize(staff)} will be notified immediately to meet us there.`,
            default_value === 'transfer_to_stabilization_area' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
          ]),
        },
        {
          id: 'come_back_later',
          name: 'Come back later',
          description: compact([
            `${capitalize(staff)} will be notified with my message.`,
            `${patient_names.preferred_name} will stay here.`,
            `I will serve other patients and come back once ${staff} ${to_be_notified.length === 1 ? 'has' : 'have'} responded.`,
          ]),
        },
        // {
        //   id: 'send_message',
        //   name: '',
        //   description: [
        //     `I will stay here in reception with ${patient_names.preferred_name}`,
        //     `${to_be_notified} will be notified immediately to join us in reception`,
        //   ],
        // },
      ]}
    />
  )
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
  const to_be_notified = useSignal<Set<RenderedEmployeeWithPresence>>(new Set())
  const to_be_notified_display = computed(() => [...to_be_notified.value].map(employeeDisplay).map((e) => e.display_name))

  return (
    <>
      <FormSection header='Next Step'>
        <FormRow>
          <NextStepSelect {...{ patient_names, priority, to_be_notified: to_be_notified_display.value }} />
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
      </FormSection>
    </>
  )
}
