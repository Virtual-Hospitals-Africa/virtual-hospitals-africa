import { ComponentChildren } from 'preact'
import { Maybe } from '../../../types.ts'

export function YesNoQuestion({
  name,
  label,
  value,
  onChange,
  isLast = false,
}: {
  name?: string
  label: string
  value?: Maybe<boolean>
  onChange?(value: boolean | null): void
  isLast?: boolean
}) {
  return (
    <div
      className={`bg-white ${
        isLast ? '' : 'border-b border-gray-300'
      } px-4 py-4 grid grid-cols-[1fr_132px_132px_132px] gap-4 items-center`}
    >
      <label className='text-sm font-medium text-gray-600'>
        {label}
      </label>
      <div className='flex justify-center'>
        <input
          name={name}
          type='radio'
          checked={value === true}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='yes'
          onChange={() => onChange?.(true)}
        />
      </div>
      <div className='flex justify-center'>
        <input
          name={name}
          type='radio'
          checked={value === false}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='no'
          onChange={() => onChange?.(false)}
        />
      </div>
      <div className='flex justify-center'>
        <input
          name={name}
          type='radio'
          checked={value === null}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='not_sure'
          onChange={() => onChange?.(null)}
        />
      </div>
    </div>
  )
}

export function YesNoGrid({ children }: { children: ComponentChildren }) {
  return (
    <div className='overflow-hidden border border-gray-300 rounded-lg'>
      <div className='bg-indigo-50 border-b border-gray-300 px-4 py-4 grid grid-cols-[1fr_132px_132px_132px] gap-4 items-center'>
        <div className='text-sm font-medium text-indigo-900'>
          Conditions
        </div>
        <div className='text-sm font-medium text-center text-indigo-900'>
          Yes
        </div>
        <div className='text-sm font-medium text-center text-indigo-900'>
          No
        </div>
        <div className='text-sm font-medium text-center text-indigo-900'>
          Not sure
        </div>
      </div>
      {children}
    </div>
  )
}
