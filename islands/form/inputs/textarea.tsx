import cls from '../../../util/cls.ts'
import { WrapperInputProps } from './_internal.tsx'
import { LabeledInput } from './labelled.tsx'

export type TextAreaProps = WrapperInputProps<HTMLTextAreaElement, string> & {
  placeholder?: string
  rows?: number
}

export function TextArea({
  name,
  label,
  placeholder,
  required,
  signal,
  value,
  onInput,
  onFocus,
  onBlur,
  disabled,
  readonly,
  className,
  inputClassName,
  rows = 3,
}: TextAreaProps) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-full', className)}
    >
      <textarea
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        value={signal?.value ?? value ?? undefined}
        onInput={(event) => {
          if (signal) signal.value = event.currentTarget.value
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={rows}
      />
    </LabeledInput>
  )
}
