import { forwardRef } from 'preact/compat'
import { ComponentChildren, Ref, SelectHTMLAttributes } from 'preact'
import cls from '../../../util/cls.ts'
import { LabeledInput, LabeledInputProps } from './labelled.tsx'

export type SelectProps =
  & Omit<
    LabeledInputProps<HTMLSelectElement>,
    'onInput'
  >
  & {
    id?: string
    onChange?: SelectHTMLAttributes<HTMLSelectElement>['onChange']
    selectClassName?: string
    children: ComponentChildren
  }

export const Select = forwardRef(
  (
    {
      name,
      id,
      label,
      required,
      onChange,
      className,
      selectClassName,
      children,
      disabled,
    }: SelectProps,
    ref: Ref<HTMLSelectElement>,
  ) => {
    return (
      <LabeledInput
        name={name}
        label={label}
        required={required}
        disabled={disabled}
        className={cls('flex-grow', className)}
      >
        <select
          {...(name && { name })}
          id={id}
          className={cls(
            'h-12 block w-full rounded-md bg-white py-1.5 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 text-black-900 dark:bg-white/5 dark:focus:text-black-900',
            selectClassName,
            disabled && 'bg-gray-300',
          )}
          required={required}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
        >
          {children}
        </select>
      </LabeledInput>
    )
  },
)
