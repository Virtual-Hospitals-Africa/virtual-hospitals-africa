import { JSX } from 'preact'
import { Combobox } from '@headlessui/react'
import { assert } from 'std/assert/assert.ts'
import { useEffect, useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { HasId, Maybe } from '../types.ts'
import isObjectLike from '../util/isObjectLike.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'

function hasId(value: unknown): value is HasId {
  return isObjectLike(value) && typeof value.id === 'number'
}

export type AsyncSearchProps<
  T extends { id?: unknown; name: string },
> = {
  href: string
  name: string
  required?: boolean
  label?: string
  addable?: boolean
  disabled?: boolean
  value?: Maybe<T>
  onSelect?: (value: T | undefined) => void
  Option(
    props: {
      option: T
      selected: boolean
      active: boolean
    },
  ): JSX.Element
}

export default function AsyncSearch<
  T extends { id?: unknown; name: string },
>({
  href,
  name,
  required,
  label,
  value,
  addable,
  disabled,
  onSelect,
  Option,
}: AsyncSearchProps<T>) {
  const [selected, setSelected] = useState<
    T | null
  >(
    hasId(value) ? value : null,
  )

  const [search, setSearch] = useState({
    query: value?.name ?? '',
    delay: null as null | number,
    active_request: null as null | XMLHttpRequest,
    results: [] as T[],
  })

  useEffect(() => {
    const url = new URL(`${window.location.origin}${href}`)
    if (search.query) {
      url.searchParams.set('search', search.query)
    }
    if (search.active_request) {
      search.active_request.abort()
    }
    if (search.delay) {
      clearTimeout(search.delay)
    }
    const request = new XMLHttpRequest()
    request.open('GET', url.toString())
    request.setRequestHeader('accept', 'application/json')
    request.onload = () => {
      if (request.status !== 200) {
        const event = new CustomEvent('request-error', {
          detail: request.responseText,
        })
        return self.dispatchEvent(event)
      }
      const people = JSON.parse(request.responseText)
      assert(Array.isArray(people))
      setSearch((search) => {
        if (search.active_request === request) {
          return {
            query: search.query,
            delay: null,
            active_request: null,
            results: people,
          }
        }
        return search
      })
    }

    const delay = setTimeout(() => {
      request.send()
      setSearch((search) => ({
        ...search,
        delay: null,
        active_request: request,
      }))
    }, 220)

    setSearch((search) => ({
      ...search,
      delay,
      active_request: null,
    }))
  }, [search.query])

  const options = addable
    ? [...search.results, {
      id: 'add' as const,
      name: search.query,
      display_name: `Add "${search.query}"`,
    } as unknown as T]
    : search.results

  return (
    <Combobox
      value={selected}
      onChange={(value) => {
        setSelected(value)
        onSelect?.(value ?? undefined)
      }}
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
            name={`${name}_name`}
            className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            onChange={(
              event,
            ) => {
              assert(event.target instanceof HTMLInputElement)
              setSelected(null)
              setSearch({
                ...search,
                query: event.target.value,
              })
            }}
            value={selected?.name}
            required={required}
            aria-disabled={disabled}
          />
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>

          {(options.length > 0) && (
            <Combobox.Options className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {options.map((option) => (
                <Combobox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    cls(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    )}
                >
                  {({ active, selected }) => (
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
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
        {(typeof selected?.id === 'number') && (
          <input type='hidden' name={`${name}_id`} value={selected.id} />
        )}
      </div>
    </Combobox>
  )
}
