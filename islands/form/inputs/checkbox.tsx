import { JSX } from 'preact'
import { WrapperInputProps } from './_internal.tsx'
import cls from '../../../util/cls.ts'

export function CheckboxInput({
  name,
  label,
  required,
  onInput,
  onFocus,
  onBlur,
  checked,
  disabled,
  readonly,
  // className,
  // inputClassName,
  value,
}:
  & Omit<
    WrapperInputProps<HTMLInputElement, boolean>,
    'signal' | 'value' | 'className' | 'inputClassName' | 'label'
  >
  & {
    label: string
    checked?: boolean
    onInput?: JSX.GenericEventHandler<HTMLInputElement>
    value?: string
  }) {
  return (
    <label className='flex items-center gap-2'>
      <input
        type='checkbox'
        {...(name && { name })}
        className={cls(
          'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 shrink-0',
          disabled && 'bg-gray-300',
        )}
        required={required}
        disabled={disabled}
        readonly={readonly}
        checked={checked}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
      />
      <span className='text-sm font-medium text-gray-600'>
        {label}
        {required && <span className='text-gray-600'>*</span>}
      </span>
    </label>
  )
}
