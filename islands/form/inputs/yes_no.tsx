import { ComponentChildren } from 'preact'
import { Maybe } from '../../../types.ts'

export function YesNoQuestion({
  name,
  label,
  value,
  onChange,
}: {
  name?: string
  label: string
  value?: Maybe<boolean>
  onChange?(value: boolean | null): void
}) {
  return (
    <>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value === true}
          className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600'
          value='on'
          onChange={() => onChange?.(true)}
        />
      </div>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value === false}
          className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600'
          value='off'
          onChange={() => onChange?.(false)}
        />
      </div>
      <div className='grid place-items-center'>
        <input
          name={name}
          type='radio'
          checked={value == null}
          className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600'
          value=''
          onChange={() => onChange?.(null)}
        />
      </div>
      <label>{label}</label>
      <div />
    </>
  )
}

export function YesNoGrid({ children }: { children: ComponentChildren }) {
  return (
    <div className='w-full grid grid-cols-[60px_60px_60px_max-content_1fr] gap-2'>
      <div className='grid place-items-center'>
        <div className='w-min'>Yes</div>
      </div>
      <div className='grid place-items-center'>
        <div className='w-min'>No</div>
      </div>
      <div className='grid place-items-center'>
        <div className='w-min'>Declined</div>
      </div>
      <div />
      <div />
      {children}
    </div>
  )
}
