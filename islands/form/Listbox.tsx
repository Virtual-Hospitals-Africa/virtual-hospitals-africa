import { Listbox } from '@headlessui/react'
import { useState } from 'react'
import { CheckIcon } from '../../components/library/CheckIcon.tsx'
import cls from '../../util/cls.ts'

interface ListboxItemProps<T> {
  label: string
  name?: string
  options: T[]
  initial_selected_ids: Array<number | string>
  onChange?(selectedValues: T[]): void
}

export function LabelledListbox<
  T extends { id: number | string; name: string },
>({
  name,
  label,
  options,
  initial_selected_ids,
  onChange,
}: ListboxItemProps<T>) {
  const [selectedIds, setselectedIds] = useState<Array<number | string>>(
    initial_selected_ids,
  )

  return (
    <div>
      <p className='text-black-600 mb-2'>{label}</p>
      <Listbox
        value={selectedIds}
        onChange={setselectedIds}
        multiple
        name={name}
      >
        <Listbox.Button className='block h-9 relative w-full rounded-md border-2 border-gray-300 bg-white text-gray-700'>
          <span className='block'>
            {selectedIds.map((id) =>
              options.find((option) => option.id === id)?.name
            ).join(', ') || 'Select...'}
          </span>
          {/* <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"></span> */}
        </Listbox.Button>

        <Listbox.Options className='relative w-full z-10 mt-2 w- bg-white border-2 border-gray-300 rounded-md shadow-lg'>
          {options.map((item) => (
            <Listbox.Option
              key={item}
              value={item.id}
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
                    {item.name}
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
