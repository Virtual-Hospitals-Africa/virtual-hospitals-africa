import cls from '../../../util/cls.ts'
import { InputProps } from './_internal.tsx'
import { LabeledInput } from './labelled.tsx'

export function ImageInput({
  name,
  label,
  placeholder,
  required,
  disabled,
  className,
  inputClassName,
  onInput,
  onFocus,
  onBlur,
}: Omit<InputProps, 'signal'>) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
    >
      <input
        type='file'
        accept='.jpg,.jpeg,.png'
        {...(name && { name })}
        className={cls(
          'w-0 h-0 overflow-hidden',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        placeholder={placeholder}
        required={required}
        onInput={(event) => {
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span className='inline-block w-full p-2 text-center text-gray-600 border-0 rounded-md shadow-sm cursor-pointer ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9'>
        Upload
      </span>
    </LabeledInput>
  )
}
