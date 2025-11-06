import { ComponentChild, ComponentChildren } from 'preact'
import { Maybe } from '../../../types.ts'

export function YesNoQuestion({
  name,
  label,
  most_recent_finding,
  value,
  onChange,
  required = false,
}: {
  name?: string
  label: ComponentChild
  most_recent_finding?: ComponentChild
  value?: Maybe<boolean>
  required?: boolean
  onChange?(value: boolean | null): void
}) {
  return (
    <div
      className={`bg-white px-4 py-4 grid grid-cols-[1fr_132px_132px_132px] gap-4 items-center`}
    >
      <div className='flex flex-col gap-2'>
        <label for={name} className='text-sm font-medium text-gray-600'>
          {label}
          {required ? '*' : ''}
        </label>
        {most_recent_finding}
      </div>

      <div className='flex justify-center'>
        <input
          name={name}
          type='radio'
          checked={value === true}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='yes'
          required={required}
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
          required={required}
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
          required={required}
          onChange={() => onChange?.(null)}
        />
      </div>
    </div>
  )
}

export function YesNoGrid({ children }: { children: ComponentChildren }) {
  return (
    <div className='overflow-visible border border-b border-gray-300 rounded-lg'>
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
