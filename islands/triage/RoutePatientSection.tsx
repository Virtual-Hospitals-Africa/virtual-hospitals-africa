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
  const staff = new Intl.ListFormat('en').format(to_be_notified) || 'Staff'

  return (
    <RadioButtonGroup
      name='next_workflow'
      defaultValue='await_consultation'
      options={[
        {
          id: 'await_consultation',
          name: 'Consultation with primary care department',
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
          description: [
            `I will stay here with ${patient_names.preferred_name}.`,
            `${staff} will be notified immediately about their case and location.`,
          ],
        },
        {
          id: 'transfer_to_stabilization_area',
          name: 'Transfer to stabilization area',
          description: [
            `I will transfer ${patient_names.preferred_name} to the stabilization area.`,
            `${staff} will be notified immediately to meet us there.`,
          ],
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
  { this_visit, patient_names, priority, facility_employees, hospital_employees }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
    patient_names: Names
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    facility_employees: RenderedEmployeeWithPresence[]
    hospital_employees: RenderedEmployeeWithPresence[]
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
            facility_employees={facility_employees}
            hospital_employees={hospital_employees}
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
