import { ComponentChildren } from 'preact'
import { SearchIcon } from '../icons/heroicons.tsx'
import capitalize from '../../../util/capitalize.ts'

type LabeledInputProps = {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
}

type SearchInputProps = Partial<LabeledInputProps>

type DateInputProps = Partial<LabeledInputProps>

type TextInputProps = LabeledInputProps & {
  type?: 'text' | 'email'
}

type SelectInputProps = LabeledInputProps & {
  children: ComponentChildren
}

function LabeledInput(
  { name, label = capitalize(name), required, children }: LabeledInputProps & {
    children: ComponentChildren
  },
) {
  return (
    <label className='block text-sm font-medium leading-6 text-gray-500 w-full'>
      {label}
      {required && '*'}
      <div className='mt-2'>
        {children}
      </div>
    </label>
  )
}

export function TextInput(
  { name, type, label, placeholder, required }: TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type={type}
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        placeholder={placeholder}
        required={required}
      />
    </LabeledInput>
  )
}

export function SelectInput(
  { name, label, required, children }: SelectInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <select
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        required={required}
      >
        {children}
      </select>
    </LabeledInput>
  )
}

export function DateInput(
  { name = 'date', label, required }: DateInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='date'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        required={required}
      />
    </LabeledInput>
  )
}

// TODO
export function PhoneNumberInput(
  { name, label, placeholder, required }: TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='tel'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        placeholder={placeholder}
        required={required}
      />
    </LabeledInput>
  )
}

// TODO
export function ImageInput(
  { name, label, placeholder, required }: TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='file'
        accept='.jpg,.jpeg,.png'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        placeholder={placeholder}
        required={required}
      />
    </LabeledInput>
  )
}

export function SearchInput(
  { name = 'search', label, placeholder, required }: SearchInputProps,
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
        />
        <div className='absolute inset-y-0 right-0 pr-1.5 grid place-items-center'>
          <SearchIcon />
        </div>
      </div>
    </LabeledInput>
  )
}
