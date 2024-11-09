import { JSX } from 'preact'
import { Combobox } from '@headlessui/react'
import { assert } from 'std/assert/assert.ts'
import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { Maybe } from '../types.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import capitalize from '../util/capitalize.ts'
import last from '../util/last.ts'
import { isUUID } from '../util/uuid.ts'
import { TargetedEvent } from 'preact/compat'

export function BaseOption<
  T extends {
    display_name?: string
    description?: string
  },
  NameField extends keyof T,
>({
  option,
  selected,
  name_field,
}: {
  option: T
  selected: boolean
  name_field: NameField
}) {
  return (
    <div className='flex flex-col'>
      <div className={cls('text-base', selected && 'font-bold')}>
        {option.display_name || option[name_field] as string}
      </div>
      {option.description && (
        <div className={cls('text-xs', selected && 'font-bold')}>
          {option.description}
        </div>
      )}
    </div>
  )
}

export type SearchProps<
  T extends Record<string, unknown>,
> = {
  name?: string
  required?: boolean
  label?: Maybe<string>
  no_name_form_data?: boolean
  addable?: boolean | {
    href?: string
    formatDisplay?: (query: string) => string
  }
  disabled?: boolean
  readonly?: boolean
  value?: Maybe<T>
  multi?: boolean
  className?: string
  loading_options?: boolean
  options: T[]
  id_field?: keyof T
  name_field?: keyof T
  loadMoreOptions?: () => void
  onQuery: (query: string) => void
  onSelect?: (value: T | undefined) => void
  Option?(
    props: {
      option: T
      selected: boolean
      active: boolean
      id_field: keyof T
      name_field: keyof T
    },
  ): JSX.Element
  optionHref?: (option: T) => string
  parse(result: unknown): T
  ignoreOptionHref?: boolean
}

function isArrayOrUUIDRecordItem(name?: Maybe<string>): boolean {
  if (!name) return false
  const last_name_part = last(name.split('.'))!
  if (isUUID(last_name_part)) return true
  return /^\d+$/.test(last_name_part)
}

export default function Search<
  T extends Record<string, unknown>,
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
  loading_options,
  options,
  className,
  id_field = 'id',
  name_field = 'name',
  loadMoreOptions,
  onQuery,
  onSelect,
  optionHref, // The existence of this prop turns the options into <a> tags
  // deno-lint-ignore no-explicit-any
  Option = BaseOption as any,
  ignoreOptionHref,
}: SearchProps<T>) {
  if (multi) {
    assert(
      typeof onSelect === 'function',
      'onSelect must be provided for a multi search',
    )
  }
  const [selected, setSelected] = useState<T | null>(value || null)

  const [query, setQuery] = useState(value ? value[name_field] as string : '')

  let formatDisplay = (query: string) => `Add "${query}"`
  if (addable && typeof addable !== 'boolean' && addable.formatDisplay) {
    formatDisplay = addable.formatDisplay
  }
  const add_option = {
    id: 'add' as const,
    name: query,
    display_name: formatDisplay(query),
  } as unknown as T
  const all_options = [...options]
  if (addable && query) {
    all_options.push(add_option)
  }

  // If the provided name is something like medications.0, we form the id field to be medications.0.id
  // while if the provided name is something like patient, we form the id field to be patient_id
  const is_array_or_record_item = isArrayOrUUIDRecordItem(name)

  const full_name_field = no_name_form_data ? undefined : (name &&
    (is_array_or_record_item
      ? `${name}.${name_field as string}`
      : `${name}_${name_field as string}`))

  const full_id_field = name &&
    (no_name_form_data
      ? name
      : (is_array_or_record_item
        ? `${name}.${id_field as string}`
        : `${name}_${id_field as string}`))

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
          <Combobox.Label className='block text-sm font-medium leading-6 text-gray-500 mb-0 ml-0.5 text-left'>
            {label}
            {required && '*'}
          </Combobox.Label>
        )}
        <div className='relative'>
          <Combobox.Input
            name={full_name_field}
            className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            onChange={(
              event,
            ) => {
              const query = event.currentTarget.value
              setSelected(null)
              onSelect?.(undefined)
              setQuery(query)
              onQuery(query)
              event.currentTarget.setCustomValidity('')
            }}
            value={selected ? selected[name_field] as string : undefined}
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

          <Combobox.Options
            onScroll={(event: TargetedEvent<HTMLUListElement>) => {
              const scrolled_to_bottom = event.currentTarget.scrollTop +
                  event.currentTarget.clientHeight >=
                event.currentTarget.scrollHeight
              if (!scrolled_to_bottom) return
              if (loading_options) return
              loadMoreOptions?.()
            }}
            className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
          >
            {all_options.map((option) => (
              <Combobox.Option
                key={option[id_field] as string}
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
                        id_field={id_field}
                        name_field={name_field}
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
                  if (ignoreOptionHref) return fragment
                  if (
                    option.id === 'add' && query && addable &&
                    typeof addable === 'object' && ('href' in addable)
                  ) {
                    return (
                      <a href={`${addable.href}${encodeURIComponent(query)}`}>
                        {fragment}
                      </a>
                    )
                  }
                  if ('href' in option && typeof option.href === 'string') {
                    return (
                      <a href={option.href}>
                        {fragment}
                      </a>
                    )
                  }
                  if (typeof optionHref === 'function') {
                    return (
                      <a href={optionHref(option)}>
                        {fragment}
                      </a>
                    )
                  }
                  return fragment
                }}
              </Combobox.Option>
            ))}
            {(loading_options || loadMoreOptions)
              ? (
                <Combobox.Option
                  key='loading'
                  value={null}
                  disabled
                >
                  <i className={cls('ml-3', !loading_options && 'opacity-0')}>
                    {all_options.length ? 'Loading more...' : 'Loading...'}
                  </i>
                </Combobox.Option>
              )
              : !all_options.length && (
                <Combobox.Option
                  key='no_options'
                  value={null}
                  disabled
                >
                  <i className='ml-3'>
                    No options available
                  </i>
                </Combobox.Option>
              )}
          </Combobox.Options>
        </div>
        {(selected?.id && selected.id !== 'add') && (
          <input
            type='hidden'
            name={full_id_field}
            // deno-lint-ignore no-explicit-any
            value={selected.id as any}
          />
        )}
      </div>
    </Combobox>
  )
}
