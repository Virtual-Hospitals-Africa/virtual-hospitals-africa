import type { ScriptItem, TutorialHashState } from '../tutorial/types.ts'
import { makeState, parseIndex } from '../tutorial/state.ts'
import type { ConsultationTutorialStep } from './types.ts'
import { CONSULTATION_TUTORIAL_STEPS } from './types.ts'

export function initialState(): TutorialHashState {
  return makeState('overview', 0)
}

export function advance(
  state: TutorialHashState,
  script: ScriptItem[],
): TutorialHashState | null {
  const current_index = parseIndex(state)
  const next_index = current_index + 1

  if (next_index >= script.length) return null

  const next_item = script[next_index]

  if (next_item.type === 'step_transition') {
    return advance(makeState(next_item.to_step, next_index), script)
  }

  return makeState(state.step, next_index)
}

export function isStepCompleted(
  current_step: ConsultationTutorialStep,
  query_step: ConsultationTutorialStep,
): boolean {
  const current_index = CONSULTATION_TUTORIAL_STEPS.indexOf(current_step)
  const query_index = CONSULTATION_TUTORIAL_STEPS.indexOf(query_step)
  return query_index < current_index
}

export function getCompletedSteps(current_step: ConsultationTutorialStep): ConsultationTutorialStep[] {
  return CONSULTATION_TUTORIAL_STEPS.filter((step) => isStepCompleted(current_step, step))
}
