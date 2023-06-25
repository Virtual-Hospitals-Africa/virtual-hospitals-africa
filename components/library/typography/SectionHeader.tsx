import { ComponentChildren } from 'preact'
import cls from '../../../util/cls.ts'

export default function SectionHeader(
  { children, className }: { children: ComponentChildren; className?: string },
) {
  return (
    <h2
      className={cls(
        'text-base font-semibold leading-6 text-gray-900',
        className,
      )}
    >
      {children}
    </h2>
  )
}
