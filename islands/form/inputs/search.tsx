import { ComponentChildren } from 'preact/src/index.d.ts'
import { MagnifyingGlassIcon } from '../../../components/library/icons/heroicons/outline.tsx'
import cls from '../../../util/cls.ts'
import { WrapperInputProps } from './_internal.tsx'
import { LabeledInput } from './labelled.tsx'

type SearchInputProps =
  & Partial<
    Omit<WrapperInputProps<HTMLInputElement, string>, 'signal'>
  >
  & {
    placeholder?: string
    children?: ComponentChildren
  }

export function SearchInput({
  name = 'search',
  label,
  value,
  placeholder,
  required,
  disabled,
  className,
  inputClassName,
  onInput,
  onFocus,
  onBlur,
  children,
  ref,
}: SearchInputProps) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-full', className)}
    >
      <div className='relative flex items-center'>
        <div className='absolute inset-y-0 left-0 pl-1.5 grid place-items-center'>
          <MagnifyingGlassIcon />
        </div>
        <input
          ref={ref}
          type='search'
          {...(name && { name })}
          className={cls(
            'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 pl-8',
            inputClassName,
            disabled && 'bg-gray-300',
          )}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value ?? ''}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      {children}
    </LabeledInput>
  )
}
