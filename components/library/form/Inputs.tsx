import { ComponentChildren, JSX, Ref } from 'preact'
import { forwardRef } from 'preact/compat'
import { MagnifyingGlassIcon } from '../icons/heroicons/outline.tsx'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'
import { Ethnicity, Maybe, NurseSpecialties } from '../../../types.ts'

type LabeledInputProps<El extends HTMLElement> = {
  name: string | null
  label?: Maybe<string>
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  ref?: Ref<El>
  className?: string
  onInput?: JSX.GenericEventHandler<El>
  onFocus?: JSX.GenericEventHandler<El>
  onBlur?: JSX.GenericEventHandler<El>
}

type WrapperInputProps<El extends HTMLElement> = LabeledInputProps<El> & {
  inputClassName?: string
}

type SearchInputProps = Partial<WrapperInputProps<HTMLInputElement>> & {
  value?: string
  placeholder?: string
  children?: ComponentChildren
}

type DateInputProps = Partial<WrapperInputProps<HTMLInputElement>> & {
  value?: Maybe<string>
}

export type TextInputProps = WrapperInputProps<HTMLInputElement> & {
  type?: 'text' | 'email' | 'tel'
  value?: Maybe<string>
  placeholder?: string
  pattern?: string
}

export type TextAreaProps = WrapperInputProps<HTMLTextAreaElement> & {
  value?: Maybe<string>
  placeholder?: string
  rows?: number
}

function LabeledInput(
  { name, label = name && capitalize(name), required, children, className }:
    & LabeledInputProps<HTMLInputElement>
    & {
      children: ComponentChildren
    },
) {
  return (
    <label
      className={cls(
        'block text-sm font-medium leading-6 text-gray-500 relative',
        className,
      )}
    >
      {label && (
        <span className='mb-1 ml-0.5'>
          {label}
          {label && required && '*'}
        </span>
      )}
      {children}
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
    className,
    inputClassName,
  }: TextInputProps,
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-full', className)}
    >
      <input
        type={type}
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={value || undefined}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        pattern={pattern}
      />
    </LabeledInput>
  )
}

export function CheckboxInput(
  {
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
  }: WrapperInputProps<HTMLInputElement> & {
    checked?: boolean
    onInput?: JSX.GenericEventHandler<HTMLInputElement>
  },
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('flex flex-col', className)}
    >
      <input
        type='checkbox'
        {...(name && { name })}
        className={cls(
          className =
            'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600',
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
    className,
    inputClassName,
    rows = 3,
  }: TextAreaProps,
) {
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
        readonly={readonly}
        value={value || undefined}
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
    selectClassName?: string
    children: ComponentChildren
  }

export const Select = forwardRef(
  (
    {
      name,
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
        className={className}
      >
        <select
          {...(name && { name })}
          className={cls(
            'block w-max rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 bg-white',
            selectClassName,
            disabled && 'text-gray-600',
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

export function DateInput(
  {
    name = 'date',
    value,
    label,
    required,
    className,
    inputClassName,
    disabled,
    onInput,
    onFocus,
    onBlur,
  }: DateInputProps,
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-40', className)}
    >
      <input
        type='date'
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        required={required}
        disabled={disabled}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value || undefined}
      />
    </LabeledInput>
  )
}

// Make this pretty with an icon and/or flag + area code helper
export function PhoneNumberInput(
  {
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
    value,
  }: TextInputProps,
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={className}
    >
      <input
        type='tel'
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        value={value || undefined}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </LabeledInput>
  )
}

export function ImageInput(
  {
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
  }:
    & TextInputProps
    & { isHidden?: boolean },
) {
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
    disabled,
    className,
    inputClassName,
    onInput,
    onFocus,
    onBlur,
    children,
    ref,
  }: SearchInputProps,
) {
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

export function NurseSpecialtySelect({ value }: { value?: Maybe<string> }) {
  const prettierSpecialtyName = (specialtyName: string): string => {
    const name = specialtyName.replaceAll('\_', ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <Select
      name='specialty'
      label='Specialty'
      required
    >
      {NurseSpecialties.map((specialty) => (
        <option
          value={specialty}
          label={prettierSpecialtyName(specialty)}
          selected={value === specialty}
        />
      ))}
    </Select>
  )
}
