import { ComponentChild, ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export function Label({
  label,
  className,
  children,
}: {
  label: null | ComponentChild
  className?: string
  children?: ComponentChildren
}) {
  return (
    <label
      className={cls(
        'block text-sm font-medium leading-6 text-gray-500 relative min-w-max',
        className,
      )}
    >
      {label}
      {children}
    </label>
  )
}
