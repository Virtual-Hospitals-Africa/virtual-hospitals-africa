import { JSX } from 'preact'
import { WrapperInputProps } from './_internal.tsx'
import cls from '../../../util/cls.ts'
import { LabeledInput } from './labelled.tsx'

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
  className,
  inputClassName,
  value,
}: Omit<WrapperInputProps<HTMLInputElement, boolean>, 'signal' | 'value'> & {
  checked?: boolean
  onInput?: JSX.GenericEventHandler<HTMLInputElement>
  value?: string
}) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('flex flex-col flex-grow-0', className)}
    >
      <div className='grid h-full place-items-center'>
        <input
          type='checkbox'
          {...(name && { name })}
          className={cls(
            'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600',
            inputClassName,
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
      </div>
    </LabeledInput>
  )
}
