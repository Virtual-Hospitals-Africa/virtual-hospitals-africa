import { Popover } from '@headlessui/react'
import { Button } from '../components/library/Button.tsx'

export type Option = { value: string; label: string; checked?: boolean }

export type FilterProps = {
  id: string
  name: string
  options: Option[]
}

export default function Filter({
  id,
  name,
  options,
}: FilterProps) {
  return (
    <Popover
      key={name}
      id={`filter-${id}`}
      className='relative inline-block text-left'
    >
      <Popover.Button className='py-1 px-4 inline-flex justify-center rounded-md font-semibold tracking-tight focus:outline-none text-base/6 border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 active:text-gray-600/70 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-transparent items-center gap-1'>
        {name}
        <svg
          width='12'
          height='8'
          viewBox='0 0 12 8'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M1 1.5L6 6.5L11 1.5'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
          />
        </svg>
      </Popover.Button>

      <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in'>
        <form className='space-y-4'>
          {options.map((option, optionIdx) => (
            <div key={option.value} className='flex gap-3'>
              <div className='flex h-5 shrink-0 items-center'>
                <div className='group grid size-4 grid-cols-1'>
                  <input
                    defaultValue={option.value}
                    id={`filter-${id}-${optionIdx}`}
                    name={`${id}`}
                    type='checkbox'
                    checked={option.checked}
                    className='col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto'
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
                className='whitespace-nowrap pr-6 text-sm font-medium text-gray-900'
              >
                {option.label}
              </label>
            </div>
          ))}
          <Button type='submit' variant='solid' size='sm' className='w-full'>
            Apply
          </Button>
        </form>
      </Popover.Panel>
    </Popover>
  )
}
