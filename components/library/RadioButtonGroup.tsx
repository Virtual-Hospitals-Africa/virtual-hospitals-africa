import cls from '../../util/cls.ts'
import { InputEventHandler } from 'preact'

type Option = {
  id: string
  name: string
  description: string | string[]
}

export function RadioButtonGroup({ options, name, defaultValue, orientation = 'vertical', onInput }: {
  options: Option[]
  name: string
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  onInput?: InputEventHandler<HTMLInputElement>
}) {
  return (
    <fieldset>
      <div
        className={cls('flex gap-4.5', {
          'flex-col': orientation === 'vertical',
          'flex-row': orientation === 'horizontal',
        })}
      >
        {options.map((option) => (
          <div key={option.id} className='flex items-start gap-3'>
            <div className='flex items-center pt-1.5'>
              <input
                defaultChecked={option.id === defaultValue}
                id={option.id}
                name={name}
                type='radio'
                value={option.id}
                aria-describedby={`${option.id}-description`}
                className='bg-white border border-gray-300 rounded-full appearance-none size-4 checked:border-indigo-700 checked:bg-white checked:ring-4 checked:ring-indigo-700 checked:ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700'
                onInput={onInput}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor={option.id}>
                <span className='text-md font-medium leading-6 text-gray-600'>
                  {option.name}
                </span>
                {(Array.isArray(option.description) ? option.description : [option.description]).map((desc, i) => (
                  <p
                    key={i}
                    className='text-sm leading-5 text-gray-600'
                  >
                    {desc}
                  </p>
                ))}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
