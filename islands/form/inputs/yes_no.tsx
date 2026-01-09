import { ComponentChild, ComponentChildren } from 'preact'
import { Existence, Maybe } from '../../../types.ts'

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
  value?: Maybe<Existence>
  required?: boolean
  onChange?(value: Existence | null): void
}) {
  return (
    <>
      <div className='flex flex-col gap-0.5 pl-4'>
        <label for={name} className='text-sm font-medium text-gray-600'>
          {label}
          {required ? '*' : ''}
        </label>
        {most_recent_finding}
      </div>

      <div className='flex justify-center align-top'>
        <input
          name={name}
          type='radio'
          checked={value === 'Yes'}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='Yes'
          required={required}
          onChange={() => onChange?.('Yes')}
        />
      </div>
      <div className='flex justify-center align-top'>
        <input
          name={name}
          type='radio'
          checked={value === 'No'}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='No'
          required={required}
          onChange={() => onChange?.('No')}
        />
      </div>
      <div className='flex justify-center align-top pr-4'>
        <input
          name={name}
          type='radio'
          checked={value === 'Unknown'}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value='Unknown'
          required={required}
          onChange={() => onChange?.('Unknown')}
        />
      </div>
    </>
  )
}

export function YesNoGrid(
  { title, children }: { title: string; children: ComponentChildren },
) {
  return (
    <div className='overflow-hidden border border-b border-gray-300 rounded-lg grid grid-cols-[auto_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)] gap-y-3 items-start pb-4'>
      <div className='text-sm font-medium text-indigo-900 capitalize bg-indigo-50 border-b border-gray-300 pl-4 py-4'>
        {title}
      </div>
      <div className='text-sm font-medium text-center text-indigo-900 bg-indigo-50 border-b border-gray-300 py-4'>
        Yes
      </div>
      <div className='text-sm font-medium text-center text-indigo-900 bg-indigo-50 border-b border-gray-300 py-4'>
        No
      </div>
      <div className='text-sm font-medium text-center text-indigo-900 bg-indigo-50 border-b border-gray-300 py-4 pr-4'>
        Unknown
      </div>
      {children}
    </div>
  )
}
