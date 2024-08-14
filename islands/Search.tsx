import { JSX } from 'preact'
import { Combobox } from '@headlessui/react'
import { assert } from 'std/assert/assert.ts'
import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { Maybe } from '../types.ts'
import isObjectLike from '../util/isObjectLike.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import capitalize from '../util/capitalize.ts'

function hasId(value: unknown): value is { id: unknown } {
  return isObjectLike(value) && !!value.id
}

export function BaseOption<
  T extends {
    id?: unknown
    name: string
    display_name?: string
    description?: string
  },
>({
  option,
  selected,
}: {
  option: T
  selected: boolean
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('truncate text-base', selected && 'font-bold')}>
        {option.display_name || option.name}
      </div>
      {option.description && (
        <div className={cls('truncate text-xs', selected && 'font-bold')}>
          {option.description}
        </div>
      )}
    </div>
  )
}

export type SearchProps<
  T extends { id?: unknown; name: string },
> = {
  name?: string
  required?: boolean
  label?: Maybe<string>
  no_name_form_data?: boolean
  addable?: boolean
  disabled?: boolean
  readonly?: boolean
  value?: Maybe<T>
  multi?: boolean
  className?: string
  options: T[]
  onQuery: (query: string) => void
  onSelect?: (value: T | undefined) => void
  Option?(
    props: {
      option: T
      selected: boolean
      active: boolean
    },
  ): JSX.Element
  optionHref?: (option: T) => string
}

export default function Search<
  T extends { id?: unknown; name: string },
>({
  name,
  required,
  label = name && capitalize(name),
  value,
  multi,
  no_name_form_data,
  addable,
  disabled,
  readonly,
  options,
  className,
  onQuery,
  onSelect,
  optionHref, // The existence of this prop turns the options into <a> tags
  Option = BaseOption,
}: SearchProps<T>) {
  if (multi) {
    assert(
      typeof onSelect === 'function',
      'onSelect must be provided for a multi search',
    )
  }
  const [selected, setSelected] = useState<
    T | null
  >(
    hasId(value) ? value : null,
  )

  const [query, setQuery] = useState(value?.name ?? '')

  const add_option = {
    id: 'add' as const,
    name: query,
    display_name: `Add "${query}"`,
  } as unknown as T

  const all_options = addable ? [...options, add_option] : options

  // If the provided name is something like medications.0, we form the id field to be medications.0.id
  // while if the provided name is something like patient, we form the id field to be patient_id
  const is_array_item = !!name && /\d$/.test(name)
  const name_field = no_name_form_data ? undefined : (name &&
    (is_array_item ? `${name}.name` : `${name}_name`))
  const id_field = name &&
    (no_name_form_data ? name : (is_array_item ? `${name}.id` : `${name}_id`))

  return (
    <Combobox
      value={selected}
      onChange={(value) => {
        onSelect?.(value ?? undefined)
        // Clear the selection for a multiselect so the user now has space to enter another value
        setSelected(multi ? null : value)
      }}
      className={className}
    >
      <div className='grow'>
        {label && (
          <Combobox.Label className='block text-sm font-medium leading-6 text-gray-500 mb-0 ml-0.5'>
            {label}
            {required && '*'}
          </Combobox.Label>
        )}
        <div className='relative'>
          <Combobox.Input
            name={name_field}
            className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            onChange={(
              event,
            ) => {
              const query = event.currentTarget.value
              setSelected(null)
              onSelect?.(undefined)
              setQuery(query)
              onQuery(query)
            }}
            value={selected?.name}
            required={required}
            aria-disabled={disabled}
            readonly={readonly}
            autoComplete='off'
            onBlur={!addable ? undefined : () => {
              if (selected) return
              onSelect?.(add_option)
              setSelected(add_option)
            }}
          />
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>

          {(all_options.length > 0) && (
            <Combobox.Options className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {all_options.map((option) => (
                <Combobox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    cls(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    )}
                >
                  {({ active, selected }) => {
                    const fragment = (
                      <>
                        <Option
                          option={option}
                          active={active}
                          selected={selected}
                        />
                        {selected && (
                          <span
                            className={cls(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              active ? 'text-white' : 'text-indigo-600',
                            )}
                          >
                            <CheckIcon className='h-5 w-5' aria-hidden='true' />
                          </span>
                        )}
                      </>
                    )
                    const href = optionHref?.(option) ||
                      ('href' in option && typeof option.href === 'string' &&
                        option.href)
                    if (!href) return fragment
                    return (
                      <a href={href}>
                        {fragment}
                      </a>
                    )
                  }}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
        {(selected?.id && selected.id !== 'add') && (
          <input
            type='hidden'
            name={id_field}
            // deno-lint-ignore no-explicit-any
            value={selected.id as any}
          />
        )}
      </div>
    </Combobox>
  )
}
