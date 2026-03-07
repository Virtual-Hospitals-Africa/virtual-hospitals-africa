import Badge from './library/Badge.tsx'
import cls from '../util/cls.ts'
import { Priority, priorityColors } from '../shared/priorities.ts'
import { nobreak } from '../util/nobreak.ts'

export default function PriorityBadge({ priority }: { priority: Priority | null }) {
  const colors = priorityColors(priority)
  return (
    <Badge
      content={nobreak(priority ?? 'Undetermined')}
      classNames={cls(colors.bg, colors.text)}
    />
  )
}
