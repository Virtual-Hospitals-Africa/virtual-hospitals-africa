import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { EvaluatedRecord, Maybe, Priority, Values } from '../types.ts'
import { ORDERED_PRIORITIES, PRIORITY_COLORS, priorityColors } from './priorities.ts'
import { errorMessageWithJsonContext } from '../util/errorMessageWithJsonContext.ts'

export function scoreAsPriority(score: Maybe<number>) {
  switch (score) {
    case null:
    case undefined:
      return
    case 0:
      // Non-urgent is green. Appears to be better to the eye
      return 'Non-urgent'
    case 1:
      return 'Urgent'
    case 2:
      return 'Very urgent'
    case 3:
      return 'Emergency'
    default:
      throw new Error(`Unexpected score ${score}`)
  }
}

export function scoreOrPriorityAsPriority(record: EvaluatedRecord): Priority | null {
  return scoreAsPriority(record.score) || record.priority || null
}

// asc
export function priorityOrder(record: EvaluatedRecord): number {
  const priority = scoreOrPriorityAsPriority(record)
  if (!priority) return Infinity
  const priority_index = ORDERED_PRIORITIES.indexOf(priority)
  assertNotEquals(priority_index, -1, errorMessageWithJsonContext(`${priority} is not a priority`, record))
  return priority_index
}

export function scoreOrPriorityColors(record: EvaluatedRecord): Values<typeof PRIORITY_COLORS> {
  const priority = scoreOrPriorityAsPriority(record)
  return priorityColors(priority)
}
