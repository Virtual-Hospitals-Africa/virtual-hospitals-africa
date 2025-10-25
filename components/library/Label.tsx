import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

type LabelProps =
  & {
    className?: string
  }
  & ({
    label?: never
    children: ComponentChildren
  } | {
    label: null | ComponentChildren
    children?: never
  })

export function Label({
  label,
  className,
  children,
}: LabelProps) {
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
