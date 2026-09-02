import { MILD_PAIN, MODERATE_PAIN, NO_PAIN, SEVERE_PAIN } from './snomed_concepts.ts'
import { Priority, SnomedConcept } from '../types.ts'

/*
  Pain is never a finding on its own, it's always the pain of something. So instead of
  recording "Severe pain" as a standalone finding, we hang a Pain level attribute off
  whichever finding hurts. s_expression/rules/pain.lisp then lifts that finding's priority.
*/
export type PainLevel = {
  concept: SnomedConcept
  label: string
  priority: null | Priority
  /* Tailwind classes, mirroring the priority the corresponding rule assigns */
  unselected: string
  selected: string
}

export const PAIN_LEVELS: PainLevel[] = [
  {
    concept: NO_PAIN,
    label: 'No pain',
    priority: null,
    unselected: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400',
    selected: 'border-gray-400 bg-gray-100 text-gray-800 ring-2 ring-gray-400',
  },
  {
    concept: MILD_PAIN,
    label: 'Mild',
    priority: 'Non-urgent',
    unselected: 'border-green-200 bg-green-50 text-green-700 hover:border-green-500',
    selected: 'border-green-500 bg-green-100 text-green-800 ring-2 ring-green-500',
  },
  {
    concept: MODERATE_PAIN,
    label: 'Moderate',
    priority: 'Urgent',
    unselected: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-500',
    selected: 'border-yellow-500 bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500',
  },
  {
    concept: SEVERE_PAIN,
    label: 'Severe',
    priority: 'Very urgent',
    unselected: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-500',
    selected: 'border-orange-500 bg-orange-100 text-orange-800 ring-2 ring-orange-500',
  },
]
