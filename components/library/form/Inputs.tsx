import { ComponentChildren, JSX, Ref } from 'preact'
import { forwardRef } from 'preact/compat'
import { MagnifyingGlassIcon } from '../icons/heroicons/outline.tsx'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'
import { Ethnicity, Maybe } from '../../../types.ts'

type LabeledInputProps<El extends HTMLElement> = {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  value?: string
  ref?: Ref<HTMLInputElement>
  onInput?: JSX.GenericEventHandler<HTMLInputElement>
  onFocus?: JSX.GenericEventHandler<HTMLInputElement>
  onBlur?: JSX.GenericEventHandler<HTMLInputElement>
}

type SearchInputProps = Partial<LabeledInputProps<HTMLInputElement>> & {
  value?: string
  children?: ComponentChildren
}

type DateInputProps = Partial<LabeledInputProps<HTMLInputElement>> & {
  value?: Maybe<string>
}

type GenderSelectProps = Partial<SelectProps>

export type TextInputProps = LabeledInputProps<HTMLInputElement> & {
  type?: 'text' | 'email' | 'tel'
  value?: Maybe<string>
  pattern?: string
}

export type TextAreaProps = LabeledInputProps<HTMLTextAreaElement> & {
  value?: Maybe<string>
  rows?: number
}

function LabeledInput(
  { name, label = capitalize(name), required, children }:
    & LabeledInputProps<HTMLInputElement>
    & {
      children: ComponentChildren
    },
) {
  return (
    <label className='block text-sm font-medium leading-6 text-gray-500 w-full relative'>
      {label}
      {label && required && '*'}
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
          disabled && 'bg-gray-300',
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={value || ''}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        pattern={pattern}
      />
    </LabeledInput>
  )
}

export function TextArea(
  {
    name,
    label,
    placeholder,
    required,
    value,
    onInput,
    onFocus,
    onBlur,
    disabled,
    readonly,
    rows = 3,
  }: TextAreaProps,
) {
  return (
    <LabeledInput name={name} label={label} required={required}>
      <textarea
        name={name}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2',
          disabled && 'bg-gray-300',
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={value || ''}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={rows}
      />
    </LabeledInput>
  )
}

export type SelectProps =
  & Omit<LabeledInputProps<HTMLSelectElement>, 'onInput'>
  & {
    onChange?: JSX.GenericEventHandler<HTMLSelectElement>
    value?: Maybe<string>
    children: ComponentChildren
  }

export const Select = forwardRef(
  (
    { name, label, required, onChange, value, children }: SelectProps,
    ref: Ref<HTMLSelectElement>,
  ) => {
    return (
      <LabeledInput name={name} label={label} required={required}>
        <select
          name={name}
          className='block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 bg-white'
          required={required}
          onChange={onChange}
          value={value}
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
        value={value || ''}
      />
    </LabeledInput>
  )
}

// Make this pretty with an icon and/or flag + area code helper
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
        value={value || ''}
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
          <MagnifyingGlassIcon />
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

export function GenderSelect(
  { value }: { value: Maybe<'male' | 'female' | 'other'> },
) {
  return (
    <Select
      required
      name='gender'
      label='Sex/Gender'
    >
      <option value=''>Select</option>
      <option value='female' label='Female' selected={value === 'female'} />
      <option value='male' label='Male' selected={value === 'male'} />
      <option value='other' label='Other' selected={value === 'other'} />
    </Select>
  )
}

export function EthnicitySelect(
  { value }: { value: Maybe<Ethnicity> },
) {
  return (
    <Select
      required
      name='ethnicity'
      label='Ethnicity'
    >
      <option value=''>Select</option>
      <option value='african' label='African' selected={value === 'african'} />
      <option
        value='african_american'
        label='African American'
        selected={value === 'african_american'}
      />
      <option value='asian' label='Asian' selected={value === 'asian'} />
      <option
        value='caribbean'
        label='Caribbean'
        selected={value === 'caribbean'}
      />
      <option
        value='caucasian'
        label='Caucasian'
        selected={value === 'caucasian'}
      />
      <option
        value='hispanic'
        label='Hispanic'
        selected={value === 'hispanic'}
      />
      <option
        value='middle_eastern'
        label='Middle Eastern'
        selected={value === 'middle_eastern'}
      />
      <option
        value='native_american'
        label='Native American'
        selected={value === 'native_american'}
      />
      <option
        value='pacific_islander'
        label='Pacific Islander'
        selected={value === 'pacific_islander'}
      />
      <option value='other' label='Other' selected={value === 'other'} />
    </Select>
  )
}

export function NationalIdInput({ value }: { value?: Maybe<string> }) {
  return (
    <TextInput
      name='national_id_number'
      label='National ID Number'
      value={value || ''}
      pattern='^\d{2}-\d{6,7}\s[A-Z]\s\d{2}$'
      placeholder='00-000000 D 00'
      required
    />
  )
}
