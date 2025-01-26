import { ComponentChildren } from 'preact'
import cls from '../../../util/cls.ts'

export function H2(
  { children, className }: { children: ComponentChildren; className?: string },
) {
  return (
    <h2
      className={cls(
        'text-sans font-semibold leading-6 text-blue-600',
        className,
      )}
    >
      {children}
    </h2>
  )
}
