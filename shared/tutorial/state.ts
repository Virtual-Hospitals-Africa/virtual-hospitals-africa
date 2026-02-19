// =============================================================================
// FILE: /shared/tutorial/state.ts
// Pure functions for tutorial state navigation
// =============================================================================

import type { ScriptItem, TutorialHashState, TutorialStep } from './types.ts'
import { TUTORIAL_STEPS } from './types.ts'

// -----------------------------------------------------------------------------
// State Factory
// -----------------------------------------------------------------------------

/**
 * Create hash state for given step and index.
 */
export function makeState(step: TutorialStep, index: number): TutorialHashState {
  return {
    step,
    index: String(index),
    action: 'tutorial',
  }
}

/**
 * Initial state: first step, index 0.
 */
export function initialState(): TutorialHashState {
  return makeState('waiting_room', 0)
}

/**
 * Parse index from hash state.
 */
export function parseIndex(state: TutorialHashState): number {
  return Number(state.index)
}

// -----------------------------------------------------------------------------
// Script Item Access
// -----------------------------------------------------------------------------

/**
 * Get item at index from script array.
 */
export function getItem(index: number, script: ScriptItem[]): ScriptItem | undefined {
  return script[index]
}

// -----------------------------------------------------------------------------
// Navigation - pure functions
// -----------------------------------------------------------------------------

/**
 * Advance to next script item, handling step transitions.
 * Returns new state or null if tutorial complete.
 *
 * When encountering a step_transition, applies the step change
 * and recursively advances to the next item.
 */
export function advance(
  state: TutorialHashState,
  script: ScriptItem[],
): TutorialHashState | null {
  const current_index = parseIndex(state)
  const next_index = current_index + 1

  // Past end of script = complete
  if (next_index >= script.length) return null

  const next_item = script[next_index]

  // Handle step transitions - apply and advance again
  if (next_item.type === 'step_transition') {
    return advance(makeState(next_item.to_step, next_index), script)
  }

  return makeState(state.step, next_index)
}

// -----------------------------------------------------------------------------
// Step Queries
// -----------------------------------------------------------------------------

/**
 * Check if a step has been completed (we're past it).
 */
export function isStepCompleted(
  currentStep: TutorialStep,
  queryStep: TutorialStep,
): boolean {
  const current_index = TUTORIAL_STEPS.indexOf(currentStep)
  const query_index = TUTORIAL_STEPS.indexOf(queryStep)
  return query_index < current_index
}

/**
 * Get all completed steps.
 */
export function getCompletedSteps(currentStep: TutorialStep): TutorialStep[] {
  return TUTORIAL_STEPS.filter((step) => isStepCompleted(currentStep, step))
}

// -----------------------------------------------------------------------------
// Derived State
// -----------------------------------------------------------------------------

/**
 * Check if cough has been selected by examining if we've passed the cough wait_click.
 * Derives this from the hash state instead of storing separately.
 */
export function hasCoughBeenSelected(
  state: TutorialHashState | { action: 'none' },
  script: ScriptItem[],
  coughSelector: string,
): boolean {
  if (state.action === 'none') return false

  const current_index = parseIndex(state as TutorialHashState)

  // Find the cough wait_click index in the script
  const cough_wait_click_index = script.findIndex(
    (item) => item.type === 'wait_click' && item.target === coughSelector,
  )

  // If we're past the cough wait_click, it was selected
  return cough_wait_click_index !== -1 && current_index > cough_wait_click_index
}
