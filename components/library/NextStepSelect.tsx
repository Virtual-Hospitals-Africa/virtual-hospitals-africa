import { TRIAGE_ROUTE_PATIENT_NEXT_STEPS, TriageRoutePatientNextStep } from '../../shared/triage_route_patient.ts'
import { Names, Priority, RenderedEmployeeWithPresenceAndSeniority, TaskWithPermissions } from '../../types.ts'
import assertOneOf from '../../util/assertOneOf.ts'
import capitalize from '../../util/capitalize.ts'
import compact from '../../util/compact.ts'
import { ArrowTrendingUpIcon, AtSymbolIcon, ClockIcon } from './icons/heroicons/outline.tsx'
import { ActionsRadioGroupSelect } from './ActionsRadioGroupSelect.tsx'
import { objectPronoun, posessivePronoun, pronoun } from '../../shared/sex_and_gender.ts'
import { preferredName } from '../../util/asNames.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'

export function NextStepSelect(
  { patient, default_next_step, priority, to_be_notified, tasks_with_permissions, onSelect }: {
    patient: {
      names: Names
      gender: string | null
    }
    default_next_step: TriageRoutePatientNextStep
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    to_be_notified: RenderedEmployeeWithPresenceAndSeniority[]
    tasks_with_permissions: TaskWithPermissions[]
    onSelect(next_step: TriageRoutePatientNextStep): void
  },
) {
  const staff = new Intl.ListFormat('en').format(to_be_notified.map(employeeDisplay).map((e) => e.display)) || 'staff'
  const no_approval_needed = tasks_with_permissions.filter((task) => task.permissions.type === 'no_approval_needed')

  const recommended = (
    <span key='recommended' className='italic'>Recommended based on {objectPronoun(patient)} having a {priority.name.toLowerCase()} case.</span>
  )
  const preferred_name = preferredName(patient, 'the patient')

  return (
    <ActionsRadioGroupSelect
      name='next_step'
      defaultValue={default_next_step}
      onInput={(event) => {
        assertOneOf(event.currentTarget.value, TRIAGE_ROUTE_PATIENT_NEXT_STEPS)
        onSelect(event.currentTarget.value)
      }}
      options={compact([
        {
          id: 'await_consultation' satisfies TriageRoutePatientNextStep,
          name: 'Await consultation',
          icon: ClockIcon,
          iconForeground: 'text-green-700',
          iconBackground: 'bg-green-50',
          description: compact([
            `I will show ${preferred_name} to the waiting room.`,
            `${capitalize(pronoun(patient))} will be prioritized based on ${posessivePronoun(patient)} ${priority.name.toLowerCase()} case.`,
            priority.target_treatment_time &&
            `Target treatment time: ${new Date(priority.target_treatment_time).toLocaleTimeString('en', { hour: 'numeric', minute: 'numeric' })}`,
            default_next_step === 'await_consultation' && recommended,
          ]),
        },
        default_next_step === 'hand_over' && {
          id: 'hand_over' satisfies TriageRoutePatientNextStep,
          name: 'Hand over',
          icon: AtSymbolIcon,
          iconForeground: 'text-yellow-700',
          iconBackground: 'bg-yellow-50',
          description: compact([
            `${staff} will be notified immediately about ${preferred_name}'s case and location.`,
            no_approval_needed.length
              ? `I will manage ${posessivePronoun(patient)} care until hand over is confirmed.`
              : `I will stay here with ${objectPronoun(patient)} until hand over is confirmed.`,
            default_next_step === 'hand_over' && recommended,
          ]),
        },
        default_next_step !== 'hand_over' && {
          id: 'check_with_colleague' satisfies TriageRoutePatientNextStep,
          name: 'Check with colleague',
          icon: AtSymbolIcon,
          iconForeground: 'text-yellow-700',
          iconBackground: 'bg-yellow-50',
          description: compact([
            `${staff} will be notified immediately about ${preferred_name}'s case and location.`,
            `I will stay and await instructions`,
            no_approval_needed.length
              ? `I will manage ${posessivePronoun(patient)} care and await instructions.`
              : `I will stay here with ${objectPronoun(patient)} and await instructions.`,
            default_next_step === 'check_with_colleague' && recommended,
          ]),
        },
        {
          id: 'stabilize_patient' satisfies TriageRoutePatientNextStep,
          name: 'Stabilize patient',
          icon: ArrowTrendingUpIcon,
          iconForeground: 'text-rose-700',
          iconBackground: 'bg-rose-50',
          description: compact([
            `I will transfer ${patient.names.preferred_name} to the stabilization area.`,
            `${staff} will be notified immediately to meet us there.`,
            default_next_step === 'stabilize_patient' && recommended,
          ]),
        },
        // TODO come_back_later?
      ])}
    />
  )
}
