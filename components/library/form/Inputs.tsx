import { ComponentChildren, JSX, Ref } from 'preact'
import { forwardRef } from 'preact/compat'
import { MagnifyingGlassIcon } from '../icons/heroicons/outline.tsx'
import capitalize from '../../../util/capitalize.ts'
import cls from '../../../util/cls.ts'
import { Gender, Maybe, NURSE_SPECIALTIES } from '../../../types.ts'
import last from '../../../util/last.ts'
import isObjectLike from '../../../util/isObjectLike.ts'

type LabeledInputProps<El extends HTMLElement> = {
  name: string | null
  label?: Maybe<string>
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  ref?: Ref<El>
  className?: string
  onInput?(e: JSX.TargetedEvent<El, Event> & { target: El }): void
  onFocus?(e: JSX.TargetedEvent<El, Event>): void
  onBlur?(e: JSX.TargetedEvent<El, Event>): void
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
  min?: Maybe<string>
  max?: Maybe<string>
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
  {
    name,
    label = name && capitalize(last(name.split('.'))!),
    required,
    children,
    className,
  }:
    & LabeledInputProps<HTMLInputElement>
    & {
      children: ComponentChildren
    },
) {
  return (
    <label
      className={cls(
        'block text-sm font-medium leading-6 text-gray-500 relative min-w-max flex-1',
        className,
      )}
    >
      {label && (
        <span className='mb-1 ml-0.5'>
          {label}
          {label && required && <sup>*</sup>}
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

export function NumberInput(
  {
    name,
    label,
    required,
    value,
    onInput,
    onFocus,
    onBlur,
    disabled,
    readonly,
    className,
    inputClassName,
    min,
    max,
  }: WrapperInputProps<HTMLInputElement> & {
    value?: Maybe<number>
    min?: number
    max?: number
  },
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-full', className)}
    >
      <input
        type='number'
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={value ?? undefined}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
        min={min}
        max={max}
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
        value={value ?? undefined}
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
    onChange?: (
      e: JSX.TargetedEvent<HTMLSelectElement, Event> & {
        target: HTMLSelectElement
      },
    ) => void
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
            'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 bg-white',
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

export const SelectWithOptions = forwardRef(
  function SelectWithOptions<
    V extends JSX.HTMLAttributes<HTMLOptionElement>['value'],
  >(
    {
      options,
      blank_option,
      value,
      ...rest
    }: Omit<SelectProps, 'children'> & {
      blank_option?: string | true
      value?: V
      options: { value: V; label?: string }[] | V[]
    },
    ref: Ref<HTMLSelectElement>,
  ) {
    return (
      <Select {...rest} ref={ref}>
        {blank_option && (
          <option value=''>
            {typeof blank_option === 'string' ? blank_option : 'Select'}
          </option>
        )}
        {options.map((option) => (
          (isObjectLike(option) && 'value' in option)
            ? (
              <option
                value={option.value}
                label={'label' in option ? option.label : String(option.value)}
                selected={value === option.value}
              />
            )
            : (
              <option
                value={option}
                label={String(option)}
                selected={value === option}
              />
            )
        ))}
      </Select>
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
    min,
    max,
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
        value={value ?? undefined}
        min={min ?? undefined}
        max={max ?? undefined}
      />
    </LabeledInput>
  )
}

// Make this pretty with an icon and/or flag + area code helper
export function PhoneNumberInput(
  {
    name,
    label,
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
        value={value ?? undefined}
        placeholder='+263 777 777 777'
        required={required}
        disabled={disabled}
        onInput={onInput}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </LabeledInput>
  )
}

export default function Example() {
  return (
    <div>
      <label
        htmlFor='phone-number'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        Phone Number
      </label>
    </div>
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
  }: TextInputProps,
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

export function ImageOrVideoInput(
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
  }: Omit<TextInputProps, 'value'> & {
    value?: Maybe<{
      mime_type: string
      url: string
    }>
  },
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
        accept='.jpg,.jpeg,.png,.gif,.mov,.mp4,.avi,.wav,.webm'
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
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      {children}
    </LabeledInput>
  )
}

export function RadioGroup(
  {
    name,
    label,
    description,
    value,
    options,
  }: {
    name: string
    label?: Maybe<string>
    description?: Maybe<string>
    value?: Maybe<string>
    options: { value: string; label?: string; description?: string }[]
  },
) {
  return (
    <div>
      <label className='text-base font-semibold text-gray-900'>
        {label}
      </label>
      {description && (
        <p className='text-sm text-gray-500'>
          {description}
        </p>
      )}
      <fieldset className='mt-4'>
        <div className='space-y-4'>
          {options.map((option) => (
            <div key={option.value} className='flex items-center'>
              <input
                id={`radio-${name}-${option.value}`}
                name={name}
                type='radio'
                checked={value === option.value}
                value={option.value}
                className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600'
              />
              <label
                htmlFor={`radio-${name}-${option.value}`}
                className='ml-3 block text-sm font-medium leading-6 text-gray-900 capitalize'
              >
                {option.label || option.value}
              </label>
              {option.description && (
                <p className='text-gray-500'>
                  {option.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export function GenderSelect(
  { value }: { value: Maybe<Gender> },
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
      <option
        value='non-binary'
        label='Non-binary'
        selected={value === 'non-binary'}
      />
    </Select>
  )
}

export function EthnicitySelect(
  { value }: { value: Maybe<string> },
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
        value='african american'
        label='African American'
        selected={value === 'african american'}
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
        value='middle eastern'
        label='Middle Eastern'
        selected={value === 'middle eastern'}
      />
      <option
        value='native american'
        label='Native American'
        selected={value === 'native american'}
      />
      <option
        value='pacific islander'
        label='Pacific Islander'
        selected={value === 'pacific islander'}
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
      {NURSE_SPECIALTIES.map((specialty) => (
        <option
          value={specialty}
          label={prettierSpecialtyName(specialty)}
          selected={value === specialty}
        />
      ))}
    </Select>
  )
}
