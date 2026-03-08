import { ComponentType, JSX } from 'preact'
import { InputEventHandler } from 'preact'
import cls from '../../util/cls.ts'

export type ActionOption = {
  id: string
  name: string
  description: string | string[]
  icon: ComponentType<JSX.SVGAttributes<SVGSVGElement>>
  iconForeground: string
  iconBackground: string
}

export function ActionsRadioGroupSelect(
  { options, name, defaultValue, onInput }: {
    options: ActionOption[]
    name: string
    defaultValue?: string
    onInput?: InputEventHandler<HTMLInputElement>
  },
) {
  return (
    <fieldset>
      <div className='divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:divide-y-0'>
        {options.map((option, idx) => (
          <label
            key={option.id}
            className={cls(
              'group relative cursor-pointer bg-white p-6',
              'focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600',
              'has-[:checked]:bg-indigo-50 has-[:checked]:outline has-[:checked]:outline-2 has-[:checked]:-outline-offset-2 has-[:checked]:outline-indigo-600',
              {
                'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none': idx === 0,
                'sm:rounded-tr-lg': idx === 1,
                'sm:rounded-bl-lg': idx === options.length - 2,
                'rounded-bl-lg rounded-br-lg sm:rounded-bl-none': idx === options.length - 1,
              },
            )}
          >
            <input
              type='radio'
              name={name}
              value={option.id}
              defaultChecked={option.id === defaultValue}
              aria-describedby={`${option.id}-description`}
              className='sr-only'
              onInput={onInput}
            />
            <div>
              <span className={cls(option.iconBackground, option.iconForeground, 'inline-flex rounded-lg p-3')}>
                <option.icon aria-hidden='true' class='size-6' />
              </span>
            </div>
            <div id={`${option.id}-description`} className='mt-8'>
              <h3 className='text-base font-semibold text-gray-900'>{option.name}</h3>
              {(Array.isArray(option.description) ? option.description : [option.description]).map((desc, i) => (
                <p key={i} className='mt-2 text-sm text-gray-500'>{desc}</p>
              ))}
            </div>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400'
            >
              <svg fill='currentColor' viewBox='0 0 24 24' class='size-6'>
                <path d='M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z' />
              </svg>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
