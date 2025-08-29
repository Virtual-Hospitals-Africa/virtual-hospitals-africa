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
        'block text-sm font-medium leading-6 text-black-900 relative min-w-max text-left',
        className,
      )}
    >
      {label}
      {children}
    </label>
  )
}
