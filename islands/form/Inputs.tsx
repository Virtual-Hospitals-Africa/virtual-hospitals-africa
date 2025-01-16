import { ComponentChildren, JSX, Ref } from 'preact'
import { forwardRef, HTMLAttributes } from 'preact/compat'
import {
  CheckCircleIcon as OutlineCheckCircleIcon,
  MagnifyingGlassIcon,
  XCircleIcon as OutlineXCircleIcon,
} from '../../components/library/icons/heroicons/outline.tsx'
import capitalize from '../../util/capitalize.ts'
import cls from '../../util/cls.ts'
import {
  Gender,
  Maybe,
  NURSE_SPECIALTIES,
  PHARMACIST_TYPES,
  PharmacistType,
  PHARMACY_TYPES,
  PharmacyType,
  Prefix,
  PREFIXES,
} from '../../types.ts'
import last from '../../util/last.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { Signal } from '@preact/signals'
import { Label } from '../../components/library/Label.tsx'

export const NoLabelButSpaceAsPlaceholder = Symbol(
  'NoLabelButSpaceAsPlaceholder',
)

type LabeledInputProps<El extends HTMLElement> = {
  name: string | null
  label?: Maybe<string | typeof NoLabelButSpaceAsPlaceholder>
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  ref?: Ref<El>
  className?: string
  onInput?: HTMLAttributes<El>['onInput']
  onFocus?: HTMLAttributes<El>['onFocus']
  onBlur?: HTMLAttributes<El>['onBlur']
}

type WrapperInputProps<El extends HTMLElement, Value> =
  & LabeledInputProps<El>
  & {
    inputClassName?: string
    value?: Maybe<Value>
    signal?: Signal<Value>
  }

type SearchInputProps =
  & Partial<Omit<WrapperInputProps<HTMLInputElement, string>, 'signal'>>
  & {
    placeholder?: string
    children?: ComponentChildren
  }

type DateInputProps = Partial<WrapperInputProps<HTMLInputElement, string>> & {
  value?: Maybe<string>
  min?: Maybe<string>
  max?: Maybe<string>
}

export type TextInputProps = WrapperInputProps<HTMLInputElement, string> & {
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  pattern?: string
  onKeyDown?: (event: KeyboardEvent) => void
}

export type TextAreaProps = WrapperInputProps<HTMLTextAreaElement, string> & {
  placeholder?: string
  rows?: number
}

export function LabeledInput(
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
    <Label
      className={label === NoLabelButSpaceAsPlaceholder
        ? cls(className, 'pt-6')
        : className}
      label={label && (label !== NoLabelButSpaceAsPlaceholder) && (
        <span className='mb-1 ml-0.5'>
          {label}
          {label && required && <sup>*</sup>}
        </span>
      )}
    >
      {children}
    </Label>
  )
}

export function TextInput(
  {
    name,
    type,
    label,
    placeholder,
    required,
    signal,
    value,
    onInput,
    onFocus,
    onBlur,
    onKeyDown,
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
      className={cls('w-full flex-1', className)}
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
        value={signal?.value || value || undefined}
        onInput={(event) => {
          if (signal) signal.value = event.currentTarget.value
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        pattern={pattern}
        autoComplete='off'
      />
    </LabeledInput>
  )
}

export function NumberInput(
  {
    name,
    label,
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
    min,
    max,
  }: WrapperInputProps<HTMLInputElement, number> & {
    min?: number
    max?: number
  },
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('w-full flex-1', className)}
    >
      <input
        type='text'
        inputmode='numeric'
        {...(name && { name })}
        className={cls(
          'block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2',
          inputClassName,
          disabled && 'bg-gray-300',
        )}
        required={required}
        disabled={disabled}
        readonly={readonly}
        value={signal?.value ?? value ?? undefined}
        onInput={(event) => {
          if (signal) signal.value = parseInt(event.currentTarget.value)
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        min={min}
        max={max}
      />
    </LabeledInput>
  )
}

export function UnitInput(
  {
    name,
    label,
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
    min,
    max,
    units,
  }: WrapperInputProps<HTMLInputElement, number> & {
    min?: number
    max?: number
    units: string
  },
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('flex gap-1 flex-col flex-grow-0', className)}
    >
      <div className='flex items-center rounded-md bg-white pl-0 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:outline-indigo-600'>
        <span className='text-gray-500 ml-2'>{units}</span>
        <input
          type='text'
          inputmode='numeric'
          {...(name && { name })}
          className={cls(
            'block w-full rounded-md border-0 outline-0 focus:ring-0 focus:outline-none text-gray-900 shadow-sm  placeholder:text-gray-400  sm:text-sm sm:leading-6',
            inputClassName,
            disabled && 'bg-gray-300',
          )}
          required={required}
          disabled={disabled}
          readonly={readonly}
          value={signal?.value ?? value ?? undefined}
          onInput={(event) => {
            if (signal) signal.value = parseInt(event.currentTarget.value)
            onInput?.(event)
            event.currentTarget.setCustomValidity('')
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          min={min}
          max={max}
        />
      </div>
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
    value,
  }: Omit<WrapperInputProps<HTMLInputElement, boolean>, 'signal' | 'value'> & {
    checked?: boolean
    onInput?: JSX.GenericEventHandler<HTMLInputElement>
    value?: string
  },
) {
  return (
    <LabeledInput
      name={name}
      label={label}
      required={required}
      className={cls('flex flex-col flex-grow-0', className)}
    >
      <div className='grid place-items-center h-full'>
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

export function TextArea(
  {
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

export type SelectProps =
  & Omit<LabeledInputProps<HTMLSelectElement>, 'onInput'>
  & {
    onChange?: HTMLAttributes<HTMLSelectElement>['onChange']
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
        className={cls('flex-grow', className)}
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
    V extends JSX.OptionHTMLAttributes<HTMLOptionElement>['value'],
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
    signal,
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
        onInput={(event) => {
          if (signal) signal.value = event.currentTarget.value
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        value={signal?.value ?? value ?? undefined}
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
    signal,
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
        value={signal?.value ?? value ?? undefined}
        placeholder='+263 777 777 777'
        required={required}
        disabled={disabled}
        onInput={(event) => {
          if (signal) signal.value = event.currentTarget.value
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
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
  }: Omit<TextInputProps, 'signal'>,
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
        onInput={(event) => {
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
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
  }: Omit<TextInputProps, 'value' | 'signal'> & {
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
        onInput={(event) => {
          onInput?.(event)
          event.currentTarget.setCustomValidity('')
        }}
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

export function YesNoQuestion(
  { name, label, value, onChange }: {
    name?: string
    label: string
    value?: Maybe<boolean>
    onChange?(value: boolean | null): void
  },
) {
  return (
    <>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value === true}
          className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600'
          value='on'
          onChange={() => onChange?.(true)}
        />
      </div>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value === false}
          className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600'
          value='off'
          onChange={() => onChange?.(false)}
        />
      </div>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value == null}
          className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600'
          value=''
          onChange={() => onChange?.(null)}
        />
      </div>
      <label>{label}</label>
      <div />
    </>
  )
}

export function YesNoGrid(
  { children }: { children: ComponentChildren },
) {
  return (
    <div className='w-full grid grid-cols-[60px_60px_60px_max-content_1fr] gap-2'>
      <div className='grid place-items-center'>
        <div className='w-min'>Yes</div>
      </div>
      <div className='grid place-items-center'>
        <div className='w-min'>No</div>
      </div>
      <div className='grid place-items-center'>
        <div className='w-min'>Declined</div>
      </div>
      <div />
      <div />
      {children}
    </div>
  )
}

export function CheckboxGridItem(
  { name, label, required, disabled, checked, onChange, children }: {
    name?: string
    label: string
    required?: boolean
    disabled?: boolean
    checked?: boolean
    onChange?(value: boolean): void
    children?: ComponentChildren
  },
) {
  return (
    <div className='w-full flex justify-start gap-2 break-before-avoid relative'>
      <div className='grid items-center'>
        <input
          name={name}
          type='checkbox'
          checked={checked}
          required={required}
          disabled={disabled}
          className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600'
          onInput={(e) => onChange?.(e.currentTarget.checked)}
        />
      </div>
      <Label label={label} />
      {children}
    </div>
  )
}

export function RadioGroup(
  {
    name,
    label,
    description,
    value,
    options,
    onChange,
  }: {
    name: string
    label?: Maybe<string>
    description?: Maybe<string>
    value?: Maybe<string>
    options: { value: string; label?: string; description?: string }[]
    onChange?(value: string): void
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
                onChange={(event) =>
                  onChange?.(event.currentTarget.value)}
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
  { value }: { value?: Maybe<Gender> },
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
  { value }: { value?: Maybe<string> },
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

export function PrefixSelect(
  { value }: { value?: Maybe<Prefix> },
) {
  return (
    <Select
      name='prefix'
      label='Prefix'
      required
    >
      {PREFIXES.map((prefix) => (
        <option
          value={prefix}
          label={prefix}
          selected={value === prefix}
        />
      ))}
    </Select>
  )
}

export function PharmacistTypeSelect(
  { value }: { value?: Maybe<PharmacistType> },
) {
  return (
    <Select
      name='pharmacist_type'
      label='Specialty'
      required
    >
      {PHARMACIST_TYPES.map((type) => (
        <option
          value={type}
          label={type}
          selected={value === type}
        />
      ))}
    </Select>
  )
}

export function PharmacyTypeSelect(
  { value }: { value?: Maybe<PharmacyType> },
) {
  return (
    <Select
      name='pharmacies_types'
      label='Specialty'
      required
    >
      {PHARMACY_TYPES.map((type) => (
        <option
          value={type}
          label={type}
          selected={value === type}
        />
      ))}
    </Select>
  )
}

export function IsSupervisorSelect(
  { value, isRequired, prefix = '' }: {
    value: Maybe<string>
    isRequired: boolean
    prefix?: string
  },
) {
  return (
    <Select
      required={isRequired}
      name={`${prefix}.is_supervisor`}
      label='Is Supervisor'
    >
      <option value=''>Select</option>
      <option value='true' label='Yes' selected={value === 'true'} />
      <option
        value='false'
        label='No'
        selected={value === 'false'}
      />
    </Select>
  )
}

export function AgreeDisagreeQuestion(
  { name, value, onChange }: {
    name?: string
    value?: Maybe<'agree' | 'disagree'>
    onChange?(value: 'agree' | 'disagree'): void
  },
) {
  return (
    <fieldset className='flex text-indigo-600'>
      <label for={`${name}-agree`} className='cursor-pointer'>
        <OutlineCheckCircleIcon
          className={cls('w-5 h-5', value === 'agree' && 'stroke-3')}
        />
        <input
          name={name}
          type='radio'
          checked={value === 'agree'}
          className='hidden'
          value='agree'
          id={`${name}-agree`}
          onChange={() => onChange?.('agree')}
        />
      </label>
      <label for={`${name}-disagree`} className='cursor-pointer'>
        <OutlineXCircleIcon
          className={cls('w-5 h-5', value === 'disagree' && 'stroke-3')}
        />
        <input
          name={name}
          type='radio'
          checked={value === 'disagree'}
          className='hidden'
          value='disagree'
          id={`${name}-disagree`}
          onChange={() => onChange?.('disagree')}
        />
      </label>
    </fieldset>
  )
}
