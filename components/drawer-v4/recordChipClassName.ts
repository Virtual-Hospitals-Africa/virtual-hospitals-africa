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

export function recordChipPaddingClassName({ with_padding_x }: {
  with_padding_x: boolean
}) {
  return cls('py-0.5 text-sm', {
    'px-4': with_padding_x,
  })
}

export function recordChipClassName(record: EvaluatedRecord) {
  const colors = scoreOrPriorityColors(record)
  return cls(
    'group box-border flex gap-2 items-center rounded-[60px] outline-none',
    recordChipPaddingClassName({ with_padding_x: true }),
    colors.bg,
    colors.text,
  )
}
