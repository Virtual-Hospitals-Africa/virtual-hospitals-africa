import { ComponentChildren, JSX, Ref } from 'preact'
import { forwardRef } from 'preact/compat'
import { SearchIcon } from '../icons/heroicons.tsx'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'

type LabeledInputProps = {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  ref?: Ref<HTMLInputElement>
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

type GenderInputProps = Partial<SelectInputProps>

export type TextInputProps = LabeledInputProps & {
  type?: 'text' | 'email' | 'tel'
  value?: string
  pattern?: string
}

type SelectInputProps = Omit<LabeledInputProps, 'onInput'> & {
  onChange?: JSX.GenericEventHandler<HTMLSelectElement>
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
  {
    name,
    type,
    label,
    placeholder,
    required,
    value,
    onInput,
    onFocus,
    onBlur,
    disabled,
    readonly,
    pattern,
  }: TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type={type}
        name={name}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          disabled ? 'bg-gray-100' : ''
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={value}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        pattern={pattern}
      />
    </LabeledInput>
  )
}

export const SelectInput = forwardRef(
  (
    { name, label, required, onChange, children }: SelectInputProps,
    ref: Ref<HTMLSelectElement>,
  ) => {
    return (
      <LabeledInput name={name} label={label} required={required}>
        <select
          name={name}
          className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
          required={required}
          onChange={onChange}
          ref={ref}
        >
          {children}
        </select>
      </LabeledInput>
    )
  },
)

export function DateInput(
  { name = 'date', value, label, required, onInput, onFocus, onBlur }:
    DateInputProps,
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
        value={value}
      />
    </LabeledInput>
  )
}

// TODO
export function PhoneNumberInput(
  { name, label, placeholder, required, onInput, onFocus, onBlur, value }:
    TextInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <input
        type='tel'
        name={name}
        className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2'
        value={value}
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
    ref,
  }: SearchInputProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <div className='relative flex items-center'>
        <div className='absolute inset-y-0 left-0 pl-1.5 grid place-items-center'>
          <SearchIcon />
        </div>
        <input
          ref={ref}
          type='search'
          name={name}
          className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 pl-8'
          placeholder={placeholder}
          required={required}
          value={value}
          onInput={onInput}
          onFocus={(e) => onFocus && onFocus(e)}
          onBlur={onBlur}
        />
      </div>
      {children}
    </LabeledInput>
  )
}

export function GenderInput(
  { name = 'gender', label = 'Gender', required, onChange, children }:
    GenderInputProps,
) {
  return (
    <SelectInput
      name={name}
      required={required}
      label={label}
      onChange={onChange}
    >
      <option value='male' label='Male'></option>
      <option value='female' label='Female'></option>
      <option value='other' label='Other'></option>
      {children}
    </SelectInput>
  )
}
