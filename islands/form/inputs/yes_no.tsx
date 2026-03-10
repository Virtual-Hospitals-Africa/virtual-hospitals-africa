import { ComponentChild, ComponentChildren } from 'preact'
import { Existence, Maybe } from '../../../types.ts'
import { useRef } from 'preact/hooks'

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
  function Input({ existence }: { existence: Existence }) {
    return (
      <div className='flex justify-center align-top'>
        <input
          id={`${name}-${existence.toLowerCase()}`}
          name={name}
          type='radio'
          checked={value === existence}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value={existence}
          required={required}
          aria-labelledby={`${name}-label`}
          onChange={() => onChange?.(existence)}
        />
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-0.5 pl-4'>
        <label
          id={`${name}-label`}
          className='text-sm font-medium text-gray-600'
        >
          {label}
          {required ? '*' : ''}
        </label>
        {most_recent_finding}
      </div>
      <Input existence='Yes' />
      <Input existence='No' />
      <Input existence='Unknown' />
    </>
  )
}

export function YesNoGrid(
  { title, children }: { title: string; children: ComponentChildren },
) {
  const ref = useRef<HTMLInputElement>(null)

  function Header({ existence }: { existence: Existence }) {
    function checkAllWithoutValues() {
      const container = ref.current!
      const inputs = container.querySelectorAll<HTMLInputElement>(`input[type="radio"][value="${existence}"]`)
      for (const input of inputs) {
        const group = container.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${input.name}"]:checked`)
        const has_different_value_checked = Array.from(group).some((sibling) => sibling.checked && sibling.value !== existence)
        if (!has_different_value_checked) {
          input.click()
        }
      }
    }

    return (
      <button
        type='button'
        className='cursor-pointer text-sm font-medium text-center text-indigo-900 bg-indigo-50 border-b border-gray-300 py-4'
        onClick={checkAllWithoutValues}
      >
        {existence}
      </button>
    )
  }

  return (
    <div
      className='overflow-scroll border border-b border-gray-300 rounded-lg grid grid-cols-[auto_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)] gap-y-2 xl:gap-y-4 items-start pb-4'
      ref={ref}
    >
      <div className='text-sm font-medium text-indigo-900 capitalize bg-indigo-50 border-b border-gray-300 pl-4 py-4'>
        {title}
      </div>
      <Header existence='Yes' />
      <Header existence='No' />
      <Header existence='Unknown' />
      {children}
    </div>
  )
}
