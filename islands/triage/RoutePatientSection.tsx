import { CarePlanGroup, Maybe, Names, Priority, RenderedEmployeeWithPresenceAndSeniority, TriageNextStepRecommendations } from '../../types.ts'
import { EncounterReason } from '../../db.d.ts'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import FormSection from '../../components/library/FormSection.tsx'
import { useSignal } from '@preact/signals'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { NextStepSelect } from '../../components/library/NextStepSelect.tsx'
import RecommendedCarePlan from '../../components/library/RecommendedCarePlan.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'

export default function TriageRoutePatientSection(
  { this_visit, patient, priority, organization_id, clinic_employees, care_plan_groups, triage_next_step_recommendations }: {
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
    organization_id: string
    clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]
    care_plan_groups: CarePlanGroup[]
    triage_next_step_recommendations: TriageNextStepRecommendations
  },
) {
  const tasks_with_permissions = care_plan_groups.flatMap((group) => group.tasks)
  const next_step = useSignal<string>(triage_next_step_recommendations.next_step)

  const to_be_notified = useSignal<RenderedEmployeeWithPresenceAndSeniority[]>(triage_next_step_recommendations.to_be_notified)

  // TODO for tomorrow
  // Panel to pick a facility to escalate to instead of within this facility
  // Warning label if the staff you're escalating to aren't enough to do/get approval for what you need?

  return (
    <div class='flex flex-col gap-6'>
      {!!care_plan_groups.length && (
        <FormSection id='recommended_care_plan' header='Recommended Care Plan' always_column>
          <FormRow>
            <RecommendedCarePlan
              to_be_notified={to_be_notified.value}
              care_plan_groups={care_plan_groups}
              organization_id={organization_id}
            />
          </FormRow>
        </FormSection>
      )}
      <FormSection id='route_patient_next_step' header='Next Step' always_column>
        <FormRow>
          <NextStepSelect
            patient={patient}
            priority={priority}
            default_next_step={triage_next_step_recommendations.next_step}
            to_be_notified={to_be_notified.value}
            tasks_with_permissions={tasks_with_permissions}
            onSelect={(step) => next_step.value = step}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Staff' always_column>
        <FormRow>
          <ProvidersSelect
            providers={clinic_employees}
            initial_selected={to_be_notified.value}
            onChange={(employees) => to_be_notified.value = employees}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Notes' always_column>
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
    </div>
  )
}
