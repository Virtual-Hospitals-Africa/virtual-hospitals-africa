import { Listbox } from '@headlessui/react'
import { useState } from 'react'
import cls from '../../util/cls.ts'
import { ComponentChild } from 'preact'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import { CheckIcon } from '../../components/library/icons/heroicons/solid.tsx'

type OptionRecord = {
  id: string | string
  name: string
  disabled?: boolean
  display?: ComponentChild
}

type Option = string | OptionRecord

type OptionId<O extends Option> = O extends { id: string | string } ? O['id']
  : string

interface ListboxMultiProps<O extends Option> {
  name?: string
  options: O[]
  selected: OptionId<O>[]
  variant?: 'always_open' | 'default'
  onChange?(selected: OptionId<O>[]): void
}

export function ListboxMulti<O extends Option>({
  name,
  options,
  selected,
  variant = 'default',
  onChange,
}: ListboxMultiProps<O>) {
  const [selected_ids, setSelectedIds] = useState(
    selected,
  )
  const using_options: OptionRecord[] = options.map((option) =>
    isString(option) ? { id: option, name: option } : option as OptionRecord
  )

  for (const option of using_options) {
    assert(option.id, `Option must have id for ${name}`)
  }

  return (
    <Listbox
      value={selected_ids}
      onChange={(ids) => {
        setSelectedIds(ids)
        onChange?.(ids)
      }}
      multiple
      name={name}
    >
      {variant === 'default' && (
        <Listbox.Button className='block min-h-9 relative w-full rounded-md border-2 border-gray-300 bg-white text-gray-700 text-left text-ellipsis'>
          <span className='block py-3 px-1.5'>
            {selected_ids.map((id) => {
              const matching_option = using_options.find((option) =>
                option.id === id
              )
              assert(
                matching_option,
                `No matching option could be found for field: ${name}, id: ${id}`,
              )
              return matching_option?.name
            }).join(', ') || 'Select...'}
          </span>
        </Listbox.Button>
      )}

      <Listbox.Options
        static={variant === 'always_open'}
        className={cls(
          'relative w-full mt-2 bg-white flex flex-col gap-2 p-1',
          variant === 'default' &&
            'border-2 rounded-md border-gray-300 shadow-lg',
        )}
      >
        {using_options.map((option) => (
          <Listbox.Option
            key={option.id}
            value={option.id}
            disabled={option.disabled}
            className={({ selected }) =>
              cls(
                'cursor-pointer select-none relative p-2 rounded-md hover:bg-indigo-100',
                selected && '!bg-indigo-500',
              )}
          >
            {({ selected }) => (
              <div
                className={cls(
                  'flex gap-2',
                  selected ? 'font-semibold text-white' : 'text-gray-900',
                  variant === 'always_open' && 'flex-row-reverse',
                )}
              >
                <span
                  className={cls(
                    'block truncate flex-grow',
                  )}
                >
                  {option.display || option.name}
                </span>
                <span
                  className={cls(
                    'flex items-center',
                    selected ? 'opacity-100' : 'opacity-0',
                    variant === 'default' && 'pr-4',
                  )}
                >
                  <CheckIcon
                    className='h-5 w-5'
                    fill='white'
                    aria-hidden='true'
                  />
                </span>
              </div>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}

export function LabelledListboxMulti<O extends Option>({
  label,
  ...props
}: ListboxMultiProps<O> & { label: string }) {
  return (
    <div>
      <p className='text-black-600 mb-2'>{label}</p>
      <ListboxMulti {...props} />
    </div>
  )
}
