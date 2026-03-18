// =============================================================================
// FILE: /shared/tutorial/types.ts
// Type definitions for multi-step tutorial system
// =============================================================================

// -----------------------------------------------------------------------------
// Tutorial Steps - ordered workflow progression
// -----------------------------------------------------------------------------

/**
 * Which UI/form to render in the tutorial.
 * Ordered by triage workflow progression.
 */
export type TutorialStep =
  | 'waiting_room'
  | 'warning_signs'
  | 'brief_history'
  | 'height_and_weight'
  | 'measure_vitals'
  | 'additional_tasks_and_investigations'
  | 'assign_priority'
  | 'route_patient'
  | 'complete'

export const TUTORIAL_STEPS: TutorialStep[] = [
  'waiting_room',
  'warning_signs',
  'brief_history',
  'height_and_weight',
  'measure_vitals',
  'additional_tasks_and_investigations',
  'assign_priority',
  'route_patient',
  'complete',
]

// -----------------------------------------------------------------------------
// Speakers
// -----------------------------------------------------------------------------

export type Speaker = 'guide' | 'patient' | 'nurse' | 'doctor' | 'pharmacist'

export const SPEAKERS = {
  guide: {
    name: 'Lindiwe Nkosi',
    avatar: '/lindiwe.png',
    color: 'indigo',
    role: 'Senior Triage Nurse',
  },
  patient: {
    name: 'Duduzile Langa',
    avatar: '/duduzile.png',
    color: 'emerald',
    role: 'Patient',
  },
  nurse: {
    name: 'Bongani Sibeko',
    avatar: '/bongani.png',
    color: 'purple',
    role: 'Senior Primary care Nurse',
  },
  doctor: {
    name: 'Dr. Lufuno Zungu',
    avatar: '/lufuno.png',
    color: 'blue',
    role: 'Doctor',
  },
  pharmacist: {
    name: 'Thabo Dhlamini',
    avatar: '/thabo.png',
    color: 'teal',
    role: 'Pharmacist',
  },
} as const

// -----------------------------------------------------------------------------
// Script Items - discriminated union on 'type' field
// -----------------------------------------------------------------------------

/**
 * Dialogue: Show speaker with text, optional element highlight.
 */
type DialogueItem = {
  type: 'dialogue'
  speaker: Speaker
  text: string
  highlight?: string | string[] // CSS selector to spotlight
  portal?: boolean // Open spotlight cutout so user can click through (click also advances)
  is_final?: boolean // Shows confetti + restart button
  link?: { title: string; href: string } // Optional small link in bottom-left
}

/**
 * Highlight: Spotlight an element, auto-advance after duration.
 */
type HighlightItem = {
  type: 'highlight'
  target: string // CSS selector
  duration?: number // ms, default 1500
}

/**
 * WaitClick: Pause until user clicks target element.
 */
type WaitClickItem = {
  type: 'wait_click'
  target: string // CSS selector
  text?: string // Optional HTML instruction shown in dialogue box
}

/**
 * StepTransition: Change which UI component is rendered.
 * Immediately transitions step, then advances to next script item.
 */
type StepTransitionItem = {
  type: 'step_transition'
  to_step: TutorialStep
}

/**
 * Modal: Show a centered modal with message and action button.
 * Clicking the button advances the script.
 */
type ModalItem = {
  type: 'modal'
  message: string
  buttonText: string
}

/**
 * A single item in the tutorial script.
 * Discriminated union on 'type' field.
 */
export type ScriptItem =
  & {
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    dangerousHTML?: boolean
    click_target_on_advance?: string
    input?: { field: string; value: string } | { field: string; value: string }[] // CSS selector(s) + value(s) to set when advancing TO this step
    onArrive?: () => void
    onLeave?: () => void
  }
  & (
    | DialogueItem
    | HighlightItem
    | WaitClickItem
    | StepTransitionItem
    | ModalItem
  )

// -----------------------------------------------------------------------------
// Hash State - encodes step + script index
// Uses 'action' field for useLocationHash compatibility
// Format: #action=step&step=warning_signs&index=5
// -----------------------------------------------------------------------------

export type TutorialHashState = {
  action: 'tutorial'
  step: TutorialStep
  index: string // numeric index as string
}

/**
 * Type guard for TutorialHashState
 */
export function isTutorialState(v: Record<string, string>): v is TutorialHashState {
  return v.action === 'tutorial' &&
    'step' in v &&
    TUTORIAL_STEPS.includes(v.step as TutorialStep) &&
    'index' in v &&
    !isNaN(Number(v.index)) &&
    Number(v.index) >= 0
}
