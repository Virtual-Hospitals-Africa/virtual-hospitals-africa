import cls from '../../util/cls.ts'
import { EvaluatedRecord } from '../../types.ts'
import { scoreOrPriorityColors } from '../../shared/sats.ts'

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
