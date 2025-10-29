import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'

type LabelProps = {
  className?: string
  label?: Maybe<ComponentChildren>
  children?: Maybe<ComponentChildren>
}

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
