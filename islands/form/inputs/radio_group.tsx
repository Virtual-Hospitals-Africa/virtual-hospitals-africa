import { Maybe } from '../../../types.ts'

export function RadioGroup({
  name,
  label,
  description,
  value,
  options,
  onChange,
}: {
  name: string
  label?: Maybe<string>
  description?: Maybe<string>
  value?: Maybe<string>
  options: { value: string; label?: string; description?: string }[]
  onChange?(value: string): void
}) {
  return (
    <div>
      <label className='text-base font-semibold text-gray-900'>{label}</label>
      {description && <p className='text-sm text-gray-500'>{description}</p>}
      <fieldset className='mt-4'>
        <div className='space-y-4'>
          {options.map((option) => (
            <div key={option.value} className='flex items-center'>
              <input
                id={`radio-${name}-${option.value}`}
                name={name}
                type='radio'
                checked={value === option.value}
                value={option.value}
                className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600'
                onChange={(event) =>
                  onChange?.(event.currentTarget.value)}
              />
              <label
                htmlFor={`radio-${name}-${option.value}`}
                className='block ml-3 text-sm font-medium leading-6 text-gray-900 capitalize'
              >
                {option.label || option.value}
              </label>
              {option.description && (
                <p className='text-gray-500'>{option.description}</p>
              )}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
