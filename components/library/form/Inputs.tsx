import { ComponentChildren, JSX } from 'preact'
import { SearchIcon } from '../icons/heroicons.tsx'
import capitalize from '../../../util/capitalize.ts'

type LabeledInputProps = {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
  onInput?: JSX.GenericEventHandler<HTMLInputElement>
  onFocus?: JSX.GenericEventHandler<HTMLInputElement>
  onBlur?: JSX.GenericEventHandler<HTMLInputElement>
}

type SearchInputProps = Partial<LabeledInputProps> & {
  value?: string
  children?: ComponentChildren
}

type DateInputProps = Partial<LabeledInputProps> & {
  value?: string
}

export type TextInputProps = LabeledInputProps & {
  type?: 'text' | 'email'
  value?: string
}

type SelectInputProps = Omit<LabeledInputProps, 'onInput'> & {
  onSelect?: JSX.GenericEventHandler<HTMLSelectElement>
  children: ComponentChildren
}

function LabeledInput(
  { name, label = capitalize(name), required, children }: LabeledInputProps & {
    children: ComponentChildren
  },
) {
  return (
    <label className='block text-sm font-medium leading-6 text-gray-500 w-full relative'>
      {label}
      {required && '*'}
      <div className='mt-2'>
        {children}
      </div>
    </label>
  )
}

export function TextInput(
  { name, type, label, placeholder, required, value, onInput, onFocus, onBlur }:
    TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type={type}
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        placeholder={placeholder}
        required={required}
        value={value}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </LabeledInput>
  )
}

export function SelectInput(
  { name, label, required, onSelect, children }: SelectInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <select
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        required={required}
        onSelect={onSelect}
      >
        {children}
      </select>
    </LabeledInput>
  )
}

export function DateInput(
  { name = 'date', label, required, onInput, onFocus, onBlur }: DateInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='date'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        required={required}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </LabeledInput>
  )
}

// TODO
export function PhoneNumberInput(
  { name, label, placeholder, required, onInput, onFocus, onBlur }:
    TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='tel'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        placeholder={placeholder}
        required={required}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </LabeledInput>
  )
}

// TODO
export function ImageInput(
  { name, label, placeholder, required, onInput, onFocus, onBlur }:
    & TextInputProps
    & { isHidden?: boolean },
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='file'
        accept='.jpg,.jpeg,.png'
        name={name}
        className='w-0 h-0 overflow-hidden'
        placeholder={placeholder}
        required={required}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <span className='inline-block w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 text-gray-600 text-center cursor-pointer'>
        Upload
      </span>
    </LabeledInput>
  )
}

export function SearchInput(
  {
    name = 'search',
    label,
    value,
    placeholder,
    required,
    onInput,
    onFocus,
    onBlur,
    children,
  }: SearchInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <div className='relative flex items-center'>
        <input
          type='search'
          name={name}
          className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
          placeholder={placeholder}
          required={required}
          value={value}
          onInput={onInput}
          onFocus={(e) => {
            console.log('WEKLEWKLWLEKWLKEW')
            onFocus && onFocus(e)
          }}
          onBlur={onBlur}
        />

        <div className='absolute inset-y-0 right-0 pr-1.5 grid place-items-center'>
          <SearchIcon />
        </div>
      </div>
      {children}
    </LabeledInput>
  )
}
