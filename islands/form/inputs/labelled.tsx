import { ComponentChildren, Ref } from 'preact'
import { HTMLAttributes } from 'preact/compat'
import { Label } from '../../../components/library/Label.tsx'
import { Maybe } from '../../../types.ts'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'
import last from '../../../util/last.ts'

export const NoLabelButSpaceAsPlaceholder = Symbol(
  'NoLabelButSpaceAsPlaceholder',
)

export type LabeledInputProps<El extends HTMLElement> = {
  name: string | null
  label?: Maybe<string | typeof NoLabelButSpaceAsPlaceholder>
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  ref?: Ref<El>
  className?: string
  defaultValue?: string
  onInput?: HTMLAttributes<El>['onInput']
  onFocus?: HTMLAttributes<El>['onFocus']
  onBlur?: HTMLAttributes<El>['onBlur']
}

export function LabeledInput({
  name,
  label = name && capitalize(last(name.split('.'))!),
  required,
  children,
  className,
}: LabeledInputProps<HTMLInputElement> & {
  children: ComponentChildren
}) {
  return (
    <Label
      className={label === NoLabelButSpaceAsPlaceholder
        ? cls(className, 'pt-6')
        : className}
      label={label &&
        label !== NoLabelButSpaceAsPlaceholder && (
        <span className='mb-1 ml-0.5'>
          {label}
          {label && required && <sup>*</sup>}
        </span>
      )}
    >
      {children}
    </Label>
  )
}
