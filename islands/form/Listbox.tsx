import { Listbox } from '@headlessui/react'
import { useState } from 'react'
import { CheckIcon } from '../../components/library/CheckIcon.tsx'
import cls from '../../util/cls.ts'
import { ComponentChild } from 'preact'

type Option = { id: number | string; name: string; display?: ComponentChild }

interface LabelledListboxProps<O extends Option> {
  label: string
  name?: string
  options: O[]
  selected: O['id'][]
  onChange?(selected: O['id'][]): void
}

export function LabelledListbox<O extends Option>({
  name,
  label,
  options,
  selected,
  onChange,
}: LabelledListboxProps<O>) {
  const [selected_ids, setSelectedIds] = useState(
    selected,
  )

  return (
    <div>
      <p className='text-black-600 mb-2'>{label}</p>
      <Listbox
        value={selected_ids}
        onChange={(ids) => {
          setSelectedIds(ids)
          onChange?.(ids)
        }}
        multiple
        name={name}
      >
        <Listbox.Button className='block h-9 relative w-full rounded-md border-2 border-gray-300 bg-white text-gray-700'>
          <span className='block'>
            {selected_ids.map((id) =>
              options.find((option) => option.id === id)?.name
            ).join(', ') || 'Select...'}
          </span>
          {/* <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"></span> */}
        </Listbox.Button>

        <Listbox.Options className='relative w-full z-10 mt-2 w- bg-white border-2 border-gray-300 rounded-md shadow-lg'>
          {options.map((option) => (
            <Listbox.Option
              key={option}
              value={option.id}
              className={({ active }) =>
                cls(
                  'cursor-pointer select-none relative p-2',
                  active ? 'bg-gray-100' : '',
                )}
            >
              {({ selected, active }) => (
                <>
                  <span
                    className={cls(
                      'block truncate',
                      selected ? 'font-semibold' : '',
                    )}
                  >
                    {option.display || option.name}
                  </span>
                  {selected
                    ? (
                      <span
                        className={cls(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-gray-600' : 'text-gray-400',
                        )}
                      >
                        <CheckIcon className='w-5 h-5' aria-hidden='true' />
                      </span>
                    )
                    : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  )
}
