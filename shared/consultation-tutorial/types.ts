import type { TutorialHashState } from '../tutorial/types.ts'

export type ConsultationTutorialStep =
  | 'overview'
  | 'registration'
  | 'triage_warning_signs'
  | 'triage_assign_priority'
  | 'examinations'
  | 'diagnostic_tests'
  | 'diagnoses'
  | 'referral'
  | 'billing'
  | 'complete'

export const CONSULTATION_TUTORIAL_STEPS: ConsultationTutorialStep[] = [
  'overview',
  'registration',
  'triage_warning_signs',
  'triage_assign_priority',
  'examinations',
  'diagnostic_tests',
  'diagnoses',
  'referral',
  'billing',
  'complete',
]

export function isConsultationTutorialState(v: Record<string, string>): v is TutorialHashState {
  return v.action === 'tutorial' &&
    'step' in v &&
    CONSULTATION_TUTORIAL_STEPS.includes(v.step as ConsultationTutorialStep) &&
    'index' in v &&
    !isNaN(Number(v.index)) &&
    Number(v.index) >= 0
}

export const CONSULTATION_SPEAKERS = {
  guide: {
    name: 'Lindiwe Nkosi',
    avatar_src: '/lindiwe.png',
    bg_class: 'bg-indigo-500',
    color: 'indigo',
    role: 'Senior Triage Nurse',
  },
  patient: {
    name: 'Nomsa Ndlovu',
    avatar_src: '/ndlovu.png',
    bg_class: 'bg-emerald-500',
    color: 'emerald',
    role: 'Patient',
  },
  doctor: {
    name: 'Dr. Lufuno Zungu',
    avatar_src: '/lufuno.png',
    bg_class: 'bg-blue-500',
    color: 'blue',
    role: 'Primary Care Doctor',
  },
  endocrinologist: {
    name: 'Dr. Amahle Dlamini',
    avatar_src: '/images/avatars/random/female/4.png',
    bg_class: 'bg-rose-500',
    color: 'rose',
    role: 'Endocrinologist',
  },
} as const

export type ConsultationSpeaker = keyof typeof CONSULTATION_SPEAKERS
