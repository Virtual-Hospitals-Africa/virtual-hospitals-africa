import { Combobox } from '@headlessui/react'
import { JSX } from 'preact'
import { TargetedEvent } from 'preact/compat'
import { useRef, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import { Maybe } from '../types.ts'
import cls from '../util/cls.ts'
import isObjectLike from '../util/isObjectLike.ts'
import last from '../util/last.ts'
import { isUUID } from '../util/uuid.ts'
import { BaseOption } from './BaseOption.tsx'
import { Label } from '../components/library/Label.tsx'

function hasId(value: unknown): value is { id: unknown } {
  return isObjectLike(value) && !!value.id
}
export type SearchProps<T extends { id?: unknown; name: string }> = {
  id?: string
  name?: string
  required?: boolean
  label?: Maybe<string>
  just_name?: boolean
  no_name_form_data?: boolean
  addable?:
    | boolean
    | {
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
  onQuery(query: string): void
  loadMoreOptions?(): void
  onSelect?(value: T | undefined): void
  Option?(props: {
    option: T
    selected: boolean
    active: boolean
  }): JSX.Element
  optionHref?(option: T): string
  ignore_option_href?: boolean
  do_not_render_built_in_options?: boolean
  placeholder?: string
}

function isArrayOrUUIDRecordItem(name?: Maybe<string>): boolean {
  if (!name) return false
  const last_name_part = last(name.split('.'))!
  if (isUUID(last_name_part)) return true
  return /^\d+$/.test(last_name_part)
}

export default function Search<T extends { id?: unknown; name: string }>({
  id,
  name,
  required,
  label,
  value,
  multi,
  just_name,
  no_name_form_data,
  addable,
  disabled,
  readonly,
  loading_options,
  options,
  className,
  loadMoreOptions,
  onQuery,
  onSelect,
  optionHref, // The existence of this prop turns the options into <a> tags
  Option = BaseOption,
  ignore_option_href,
  do_not_render_built_in_options,
  placeholder = '',
}: SearchProps<T>) {
  if (multi) {
    assert(
      typeof onSelect === 'function',
      'onSelect must be provided for a multi search',
    )
  }
  const [selected, setSelected] = useState<T | null>(
    hasId(value) ? value : null,
  )

  const [query, setQuery] = useState(value?.name ?? '')

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

  const name_field = just_name
    ? name
    : no_name_form_data
    ? undefined
    : name && (is_array_or_record_item ? `${name}.name` : `${name}_name`)
  const id_field = just_name ? undefined : name &&
    (no_name_form_data
      ? name
      : is_array_or_record_item
      ? `${name}.id`
      : `${name}_id`)

  const input_ref = useRef<HTMLInputElement>(null)

  return (
    <Combobox
      id={id}
      value={selected}
      onChange={(value) => {
        onSelect?.(value ?? undefined)
        // Clear the selection for a multiselect so the user now has space to enter another value
        setSelected(multi ? null : value)

        // Gets picked up by hijack-form-submission-and-set-focus.js to focus on the next input
        if (value && input_ref.current) {
          self.dispatchEvent(
            new CustomEvent('search-select', {
              detail: input_ref.current,
            }),
          )
        }
      }}
      className={className}
    >
      <div className='grow'>
        {label && (
          <Combobox.Label>
            <Label>
              {label}
              {required && '*'}
            </Label>
          </Combobox.Label>
        )}
        <div className='relative'>
          <Combobox.Input
            ref={input_ref}
            name={name_field}
            className={cls(
              'h-12 block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-black-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 dark:bg-white/5 dark:focus:text-black-900',
              disabled && 'bg-gray-300',
            )}
            onChange={(event) => {
              const query = event.currentTarget.value
              setSelected(null)
              onSelect?.(undefined)
              setQuery(query)
              onQuery(query)
              event.currentTarget.setCustomValidity('')
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
            placeholder={placeholder}
          />
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none'>
            <ChevronUpDownIcon
              className='w-5 h-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>

          {!do_not_render_built_in_options && (
            <Combobox.Options
              onScroll={(event: TargetedEvent<HTMLUListElement>) => {
                const scrolled_to_bottom = event.currentTarget.scrollTop +
                    event.currentTarget.clientHeight >=
                  event.currentTarget.scrollHeight
                if (!scrolled_to_bottom) return
                if (loading_options) return
                loadMoreOptions?.()
              }}
              className='absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
            >
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
                            <CheckIcon className='w-5 h-5' aria-hidden='true' />
                          </span>
                        )}
                      </>
                    )
                    if (ignore_option_href) return fragment
                    if (
                      option.id === 'add' &&
                      query &&
                      addable &&
                      typeof addable === 'object' &&
                      'href' in addable
                    ) {
                      return (
                        <a href={`${addable.href}${encodeURIComponent(query)}`}>
                          {fragment}
                        </a>
                      )
                    }
                    if ('href' in option && typeof option.href === 'string') {
                      return <a href={option.href}>{fragment}</a>
                    }
                    if (typeof optionHref === 'function') {
                      return <a href={optionHref(option)}>{fragment}</a>
                    }
                    return fragment
                  }}
                </Combobox.Option>
              ))}
              {loading_options || loadMoreOptions
                ? (
                  <Combobox.Option key='loading' value={null} disabled>
                    <i className={cls('ml-3', !loading_options && 'opacity-0')}>
                      {all_options.length ? 'Loading more...' : 'Loading...'}
                    </i>
                  </Combobox.Option>
                )
                : (
                  !all_options.length && (
                    <Combobox.Option key='no_options' value={null} disabled>
                      <i className='ml-3'>No options available</i>
                    </Combobox.Option>
                  )
                )}
            </Combobox.Options>
          )}
        </div>
        {selected?.id && selected.id !== 'add' && id_field && (
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
