import FormRow from '../library/FormRow.tsx'
import { Maybe, Names } from '../../types.ts'
import FormSection from '../library/FormSection.tsx'
import { EncounterReason } from '../../db.d.ts'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'
import { VerticalRadioButtons } from '../library/VerticalRadioButtons.tsx'
import compact from '../../util/compact.ts'

export default function RegistrationRoutePatientSection(
  { this_visit, can_do_triage, patient_names, senior_health_worker_name }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
    patient_names: Names
    can_do_triage: boolean
    senior_health_worker_name: string
  },
) {
  return (
    <>
      <FormSection header='Patient Information'>
        <FormRow>
          <VerticalRadioButtons
            name='next_workflow'
            defaultValue='await_triage'
            options={[
              {
                id: 'await_triage',
                name: 'Await triage prior to consultation',
                description: [
                  `I will show ${patient_names.preferred_name} to the waiting room.`,
                  `The next available health worker will triage ${patient_names.preferred_name} prior to consultation.`,
                ],
              },
              {
                id: 'immediate_triage',
                name: 'Immediate transfer to triage',
                description: compact([
                  `I will transfer ${patient_names.preferred_name} immediately to the triage area as this appears to be an urgent case`,
                  can_do_triage
                    ? null
                    : `${senior_health_worker_name} will be notified immediately to meet us in the triage area`,
                ]),
              },
              {
                id: 'call_for_help',
                name: 'Call for help in reception area',
                description: [
                  `I will stay here in reception with ${patient_names.preferred_name}`,
                  `${senior_health_worker_name} will be notified immediately to join us in reception`,
                ],
              },
            ]}
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
