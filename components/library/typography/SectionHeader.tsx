import { ComponentChildren } from 'preact'
import cls from '../../../util/cls.ts'

export default function SectionHeader(
  { children, className }: { children: ComponentChildren; className?: string },
) {
  return (
    <h2
      className={cls(
        'text-xl font-semibold leading-7 text-gray-900',
        className,
      )}
    >
      {children}
    </h2>
  )
}
