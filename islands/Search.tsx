import { Combobox, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import { JsonSerializable, Maybe } from '../types.ts'
import cls from '../util/cls.ts'
import isObjectLike from '../util/isObjectLike.ts'
import last from '../util/last.ts'
import { isUUID } from '../util/uuid.ts'
import { BaseOption } from './BaseOption.tsx'
import { Label } from '../components/library/Label.tsx'
import { Signal, useSignal } from '@preact/signals'
import RemovableChip from '../components/RemovableChip.tsx'
import remove from '../util/remove.ts'
import { HiddenInput } from '../components/library/HiddenInput.tsx'
import isString from '../util/isString.ts'

function hasId(value: unknown): value is { id: string } {
  return isObjectLike(value) && !!value.id && isString(value.id)
}

export type OptionLike = {
  id?: string
  name?: Maybe<string>
  display_name?: Maybe<string>
}

export type SearchPropsCommon<
  T extends OptionLike,
> = {
  id?: string
  name?: string
  required?: boolean
  label?: Maybe<string>
  just_name?: boolean
  addable?:
    | boolean
    | {
      href?: string
      formatDisplay?: (query: string) => string
    }
  disabled?: boolean
  readonly?: boolean
  className?: string
  loading_options?: boolean
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
  skip_blank_search?: boolean
}

type SearchOptionsProps<T> = {
  options: T[]
  onQuery(query: string): void
}

export type SearchPropsSingular<
  T extends OptionLike,
> = {
  multi?: never
  value?: Maybe<T>
  signal?: Signal<Maybe<T>>
}

export type SearchPropsMulti<
  T extends OptionLike,
> = {
  multi: true
  value?: never
  signal: Signal<T[]>
}

export type SearchProps<
  T extends OptionLike,
> =
  & SearchPropsCommon<T>
  & SearchOptionsProps<T>
  & (
    SearchPropsSingular<T> | SearchPropsMulti<T>
  )

function isArrayOrUUIDRecordItem(name?: Maybe<string>): boolean {
  if (!name) return false
  const surname_part = last(name.split('.'))!
  if (isUUID(surname_part)) return true
  return /^\d+$/.test(surname_part)
}

export default function Search<
  T extends OptionLike,
>({
  id,
  name,
  required,
  label,
  value,
  signal,
  multi,
  just_name,
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
  skip_blank_search,
  ...props
}: SearchProps<T>) {
  if (multi) {
    assert(signal)
    assert(Array.isArray(signal.value))
    assert(!onSelect)
  }

  // deno-lint-ignore react-rules-of-hooks
  const selected_singular = multi ? undefined : (signal || useSignal<T | null>(
    hasId(value) ? value : null,
  ))
  const selected_multi = multi ? signal : undefined

  const [query, setQuery] = useState(value?.name ?? '')

  let formatDisplay = (query: string) => `Add "${query}"`
  if (addable && typeof addable !== 'boolean' && addable.formatDisplay) {
    formatDisplay = addable.formatDisplay
  }
  const add_option = {
    id: just_name ? query : 'add' as const,
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

  const search_field = multi
    ? `${name}.search`
    : just_name
    ? name
    : name && (is_array_or_record_item ? `${name}.name` : `${name}_name`)

  const id_field = just_name ? undefined : name &&
    (is_array_or_record_item ? `${name}.id` : `${name}_id`)

  const input_ref = useRef<HTMLInputElement>(null)
  const button_ref = useRef<HTMLButtonElement>(null)

  return (
    <Combobox
      by='id'
      id={id}
      value={selected_singular?.value}
      onChange={(value) => {
        onSelect?.(value ?? undefined)
        if (selected_singular) {
          selected_singular.value = value
          // Gets picked up by general.js to focus on the next input
          if (value && input_ref.current) {
            self.dispatchEvent(
              new CustomEvent('search-select', {
                detail: input_ref.current,
              }),
            )
          }
          return
        }

        assert(selected_multi)
        if (!value) return
        const already_selected = selected_multi.value.some(
          (selected_option) =>
            (value === selected_option) ||
            (!!value.id && value.id === selected_option.id),
        )
        if (already_selected) return
        selected_multi.value = [...selected_multi.value, value]
      }}
      {...props}
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
          {multi
            ? (
              <div
                className={cls(
                  'flex flex-wrap gap-2 items-center rounded-md bg-white min-h-12 py-1.5 pl-3 pr-12 outline -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 dark:bg-white/5',
                  disabled && 'bg-gray-300',
                  className,
                )}
              >
                {selected_multi?.value.map((selected) => (
                  <RemovableChip
                    key={selected.id}
                    display={(selected.display_name || selected.name)!}
                    remove={() => {
                      console.log(selected_multi.value)
                      console.log(selected)
                      selected_multi.value = remove(
                        selected_multi.value,
                        selected,
                      )
                    }}
                  />
                ))}
                <Combobox.Input
                  ref={input_ref}
                  name={search_field}
                  className='flex-1 min-w-50 border-none outline-none focus:ring-0 p-0 bg-transparent text-black-900 placeholder:text-gray-400 sm:text-sm/6 dark:focus:text-black-900'
                  onChange={(event) => {
                    const query = event.currentTarget.value
                    onSelect?.(undefined)
                    setQuery(query)
                    onQuery(query)
                    event.currentTarget.setCustomValidity('')
                  }}
                  onClick={() => {
                    // Open the dropdown when clicking the input
                    button_ref.current?.click()
                  }}
                  required={required}
                  aria-disabled={disabled}
                  readonly={readonly}
                  autoComplete='off'
                  placeholder={selected_multi!.value.length ? '' : placeholder}
                />
              </div>
            )
            : (
              <Combobox.Input
                ref={input_ref}
                name={search_field}
                className={cls(
                  'h-12 block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-black-900 outline -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 dark:bg-white/5 dark:focus:text-black-900',
                  disabled && 'bg-gray-300',
                )}
                onChange={(event) => {
                  const query = event.currentTarget.value
                  if (selected_singular) {
                    selected_singular.value = null
                  }
                  onSelect?.(undefined)
                  setQuery(query)
                  onQuery(query)
                  event.currentTarget.setCustomValidity('')
                }}
                onClick={() => {
                  // Open the dropdown when clicking the input
                  button_ref.current?.click()
                }}
                value={selected_singular?.value?.name || undefined}
                required={required}
                aria-disabled={disabled}
                readonly={readonly}
                autoComplete='off'
                onBlur={!addable ? undefined : () => {
                  if (selected_singular?.value) return
                  if (!query) return
                  onSelect?.(add_option)
                  if (selected_singular) {
                    selected_singular.value = add_option
                  }
                }}
                placeholder={placeholder}
              />
            )}
          <Combobox.Button
            ref={button_ref}
            className='absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none'
          >
            <ChevronUpDownIcon
              className='w-5 h-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>

          {!do_not_render_built_in_options && !(skip_blank_search && !query) &&
            (
              <ComboboxOptions
                onScroll={(event: Event) => {
                  const target = event.currentTarget as HTMLElement
                  const scrolled_to_bottom = target.scrollTop +
                      target.clientHeight >=
                    target.scrollHeight
                  if (!scrolled_to_bottom) return
                  if (loading_options) return
                  loadMoreOptions?.()
                }}
                className='absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
              >
                {all_options.map((option) => (
                  <ComboboxOption
                    key={option.id}
                    value={option}
                    className={({ focus }: { focus: boolean }) =>
                      cls(
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                        focus ? 'bg-indigo-600 text-white' : 'text-gray-900',
                      )}
                  >
                    {(
                      { focus, selected }: {
                        focus: boolean
                        selected: boolean
                      },
                    ) => {
                      const use_selected = multi
                        ? selected_multi!.value.some(
                          (selected_option) =>
                            (option === selected_option) ||
                            (!!option.id && option.id === selected_option.id),
                        )
                        : selected
                      const fragment = (
                        <>
                          <Option
                            option={option}
                            active={focus}
                            selected={use_selected}
                          />
                          {use_selected && (
                            <span
                              className={cls(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                focus ? 'text-white' : 'text-indigo-600',
                              )}
                            >
                              <CheckIcon
                                className='w-5 h-5'
                                aria-hidden='true'
                              />
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
                          <a
                            href={`${addable.href}${encodeURIComponent(query)}`}
                          >
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
                  </ComboboxOption>
                ))}
                {loading_options && (
                  <div className='relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500'>
                    <i className='ml-3'>
                      {all_options.length ? 'Loading more...' : 'Loading...'}
                    </i>
                  </div>
                )}
                {!loading_options && !all_options.length && (
                  <div className='relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500'>
                    <i className='ml-3'>No options available</i>
                  </div>
                )}
              </ComboboxOptions>
            )}
        </div>
        {selected_singular && (
          selected_singular.value?.id && selected_singular.value.id !== 'add' &&
          id_field && (
            <HiddenInput
              name={id_field}
              value={selected_singular.value.id as string}
            />
          )
        )}
        {selected_multi && (
          <HiddenInput
            name={name}
            value={selected_multi.value as JsonSerializable}
          />
        )}
      </div>
    </Combobox>
  )
}
