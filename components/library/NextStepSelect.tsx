import { TriageRoutePatientNextStep, TRIAGE_ROUTE_PATIENT_NEXT_STEPS } from '../../shared/triage_route_patient.ts'
import { Names, Priority } from '../../types.ts'
import assertOneOf from '../../util/assertOneOf.ts'
import capitalize from '../../util/capitalize.ts'
import compact from '../../util/compact.ts'
import { ArrowTrendingUpIcon, AtSymbolIcon, ClockIcon, ReceiptRefundIcon } from './icons/heroicons/solid.tsx'
import { ActionsRadioGroupSelect } from './ActionsRadioGroupSelect.tsx'

export function NextStepSelect(
  { patient_names, default_next_step, priority, to_be_notified, onSelect }: {
    patient_names: Names
    default_next_step: TriageRoutePatientNextStep
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    to_be_notified: string[]
    onSelect(next_step: TriageRoutePatientNextStep): void
  },
) {
  const staff = new Intl.ListFormat('en').format(to_be_notified) || 'staff'

  return (
    <ActionsRadioGroupSelect
      name='next_step'
      defaultValue={default_next_step}
      onInput={(event) => {
        assertOneOf(event.currentTarget.value, TRIAGE_ROUTE_PATIENT_NEXT_STEPS)
        onSelect(event.currentTarget.value)
      }}
      options={[
        {
          id: 'await_consultation' satisfies TriageRoutePatientNextStep,
          name: 'Await consultation',
          icon: ClockIcon,
          iconForeground: 'text-teal-700',
          iconBackground: 'bg-teal-50',
          description: compact([
            `I will show ${patient_names.preferred_name} to the waiting room.`,
            `Their case will be prioritized based on their having a ${priority.name.toLowerCase()} case.`,
            priority.target_treatment_time &&
            `Target treatment time: ${new Date(priority.target_treatment_time).toLocaleTimeString('en', { hour: 'numeric', minute: 'numeric' })}`,
          ]),
        },
        {
          id: 'refer_case' satisfies TriageRoutePatientNextStep,
          name: 'Refer case',
          icon: AtSymbolIcon,
          iconForeground: 'text-sky-700',
          iconBackground: 'bg-sky-50',
          description: compact([
            `I will stay here with ${patient_names.preferred_name}.`,
            `${capitalize(staff)} will be notified immediately about their case and location.`,
            default_next_step === 'refer_case' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
          ]),
        },
        {
          id: 'stabilize_patient' satisfies TriageRoutePatientNextStep,
          name: 'Stabilize patient',
          icon: ArrowTrendingUpIcon,
          iconForeground: 'text-rose-700',
          iconBackground: 'bg-rose-50',
          description: compact([
            `I will transfer ${patient_names.preferred_name} to the stabilization area.`,
            `${capitalize(staff)} will be notified immediately to meet us there.`,
            default_next_step === 'stabilize_patient' && `Recommended based on their having a ${priority.name.toLowerCase()} case.`,
          ]),
        },
        {
          id: 'come_back_later' satisfies TriageRoutePatientNextStep,
          name: 'Come back later',
          icon: ReceiptRefundIcon,
          iconForeground: 'text-yellow-700',
          iconBackground: 'bg-yellow-50',
          description: compact([
            `${capitalize(staff)} will be notified with my message.`,
            `${patient_names.preferred_name} will stay here.`,
            `I will serve other patients and come back once ${staff} ${to_be_notified.length === 1 ? 'has' : 'have'} responded.`,
          ]),
        },
      ]}
    />
  )
}
