import { Popover } from '@headlessui/react'

export type Option<T extends string> = {
  value: T
  label: string
  checked?: boolean
  onChanged?: (value: T) => void
}

export type FilterProps<T extends string> = {
  id: string
  name: string
  options: Option<T>[]
}

export default function Filter<T extends string>({
  id,
  name,
  options,
}: FilterProps<T>) {
  const [first_selected, ...others] = options.filter((option) => option.checked)

  let display = first_selected?.label || name
  if (others.length) {
    display += '...'
  }

  return (
    <Popover
      key={name}
      id={`filter-${id}`}
      className='relative inline-block text-left'
    >
      {/* TODO: Use custom Button component */}
      <Popover.Button className='inline-flex items-center justify-center w-full gap-2 px-4 py-1 font-semibold tracking-tight text-gray-600 capitalize border border-gray-300 rounded-md focus:outline-none text-base/6 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 active:text-gray-600/70 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-transparent'>
        <svg
          width='20'
          height='18'
          viewBox='0 0 20 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M18.3346 1.5H1.66797L8.33464 9.38333V14.8333L11.668 16.5V9.38333L18.3346 1.5Z'
            stroke='currentColor'
            stroke-width='1.66667'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
        {display}
      </Popover.Button>

      <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in max-h-[20rem] overflow-y-auto'>
        <div className='space-y-4'>
          {options.map((option, optionIdx) => (
            <div key={option.value} className='flex gap-3'>
              <div className='flex items-center h-5 shrink-0'>
                <div className='grid grid-cols-1 group size-4'>
                  <input
                    defaultValue={option.value}
                    id={`filter-${id}-${optionIdx}`}
                    name={`${id}`}
                    type='checkbox'
                    checked={option.checked}
                    onInput={(e) => option.onChanged?.(e.currentTarget.value as T)}
                    className='col-start-1 row-start-1 bg-white border border-gray-300 rounded appearance-none checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
                  />
                  <svg
                    fill='none'
                    viewBox='0 0 14 14'
                    className='pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25'
                  >
                    <path
                      d='M3 8L6 11L11 3.5'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='opacity-0 group-has-[:checked]:opacity-100'
                    />
                    <path
                      d='M3 7H11'
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='opacity-0 group-has-[:indeterminate]:opacity-100'
                    />
                  </svg>
                </div>
              </div>
              <label
                htmlFor={`filter-${id}-${optionIdx}`}
                className='pr-6 text-sm font-medium text-gray-700 whitespace-nowrap'
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  )
}
