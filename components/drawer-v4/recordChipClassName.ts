import cls from '../../util/cls.ts'
import { Priority, PRIORITY_COLORS, priorityColors } from '../../shared/priorities.ts'
import { DeepMaybe, Maybe, Values } from '../../types.ts'

type EvaluatedRecord = DeepMaybe<{
  score: number
  priority: Priority
}>

function scoreAsPriority(score: Maybe<number>) {
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

function scoreOrPriorityColors(record: EvaluatedRecord): Values<typeof PRIORITY_COLORS> {
  const priority = scoreAsPriority(record.score) || record.priority
  return priorityColors(priority)
}

export const record_chip_padding_class_name = 'py-0.5 text-sm'

export function recordChipClassName(record: EvaluatedRecord) {
  const colors = scoreOrPriorityColors(record);
  return cls(
    "group box-border flex gap-2 items-center px-4 rounded-[60px] outline-none",
    record_chip_padding_class_name,
    colors.bg,
    colors.text
  )
}