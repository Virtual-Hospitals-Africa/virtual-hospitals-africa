import { ComponentChild, ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'
import { Maybe } from '../../types.ts'

type LabelProps =
  & {
    className?: string
    htmlFor?: string
  }
  & (
    {
      label?: Maybe<ComponentChild>
      children: ComponentChildren
    } | {
      label: ComponentChild
      children?: Maybe<ComponentChildren>
    }
  )

export function Label({
  label,
  className,
  children,
  htmlFor,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cls(
        'block text-sm font-medium leading-6 text-black-900 relative text-left',
        className,
      )}
    >
      {label}
      {children}
    </label>
  )
}
