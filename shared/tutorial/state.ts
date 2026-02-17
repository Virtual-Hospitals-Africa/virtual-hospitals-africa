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
export const makeState = (step: TutorialStep, idx: number): TutorialHashState => ({
  action: 'tutorial',
  step,
  idx: String(idx),
})

/**
 * Initial state: first step, index 0.
 */
export const initialState = (): TutorialHashState => makeState('warning_signs', 0)

/**
 * Parse index from hash state.
 */
export const parseIndex = (state: TutorialHashState): number => Number(state.idx)

// -----------------------------------------------------------------------------
// Script Item Access
// -----------------------------------------------------------------------------

/**
 * Get item at index from script array.
 */
export const getItem = (index: number, script: ScriptItem[]): ScriptItem | undefined => script[index]

// -----------------------------------------------------------------------------
// Navigation - pure functions
// -----------------------------------------------------------------------------

/**
 * Advance to next script item, handling step transitions.
 * Returns new state or null if tutorial complete.
 *
 * When encountering a stepTransition, applies the step change
 * and recursively advances to the next item.
 */
export const advance = (
  state: TutorialHashState,
  script: ScriptItem[],
): TutorialHashState | null => {
  const currentIdx = parseIndex(state)
  const nextIdx = currentIdx + 1

  // Past end of script = complete
  if (nextIdx >= script.length) return null

  const nextItem = script[nextIdx]

  // Handle step transitions - apply and advance again
  if (nextItem.type === 'stepTransition') {
    return advance(makeState(nextItem.toStep, nextIdx), script)
  }

  return makeState(state.step, nextIdx)
}

// -----------------------------------------------------------------------------
// Step Queries
// -----------------------------------------------------------------------------

/**
 * Check if a step has been completed (we're past it).
 */
export const isStepCompleted = (
  currentStep: TutorialStep,
  queryStep: TutorialStep,
): boolean => {
  const currentIdx = TUTORIAL_STEPS.indexOf(currentStep)
  const queryIdx = TUTORIAL_STEPS.indexOf(queryStep)
  return queryIdx < currentIdx
}

/**
 * Get all completed steps.
 */
export const getCompletedSteps = (currentStep: TutorialStep): TutorialStep[] => TUTORIAL_STEPS.filter((step) => isStepCompleted(currentStep, step))

// -----------------------------------------------------------------------------
// Derived State
// -----------------------------------------------------------------------------

/**
 * Check if cough has been selected by examining if we've passed the cough waitClick.
 * Derives this from the hash state instead of storing separately.
 */
export const hasCoughBeenSelected = (
  state: TutorialHashState | { action: 'none' },
  script: ScriptItem[],
  coughSelector: string,
): boolean => {
  if (state.action === 'none') return false

  const currentIdx = parseIndex(state as TutorialHashState)

  // Find the cough waitClick index in the script
  const coughWaitClickIdx = script.findIndex(
    (item) => item.type === 'waitClick' && item.target === coughSelector,
  )

  // If we're past the cough waitClick, it was selected
  return coughWaitClickIdx !== -1 && currentIdx > coughWaitClickIdx
}
