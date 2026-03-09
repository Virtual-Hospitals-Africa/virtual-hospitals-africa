import { ComponentChild, ComponentType, JSX } from 'preact'
import { InputEventHandler } from 'preact'
import cls from '../../util/cls.ts'

export type ActionOption = {
  id: string
  name: string
  description: string | ComponentChild[]
  iconForeground: string
  iconBackground: string
  icon: ComponentType<JSX.SVGAttributes<SVGSVGElement>>
}

export function ActionsRadioGroupSelect(
  { options, name, defaultValue, onInput }: {
    name: string
    defaultValue?: string
    options: ActionOption[]
    onInput?: InputEventHandler<HTMLInputElement>
  },
) {
  return (
    <fieldset>
      <div className='divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow md:grid md:grid-cols-2 sm:divide-y-0'>
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
            <span
              aria-hidden='true'
              className={cls(option.iconBackground, option.iconForeground, 'absolute right-5 top-2.5 inline-flex rounded-lg p-3 hidden md:show')}
            >
              <option.icon aria-hidden='true' class='size-6' />
            </span>
            <div id={`${option.id}-description`}>
              <h3 className='text-base font-semibold text-gray-900'>{option.name}</h3>
              {(Array.isArray(option.description) ? option.description : [option.description]).map((desc, i) => (
                <p key={i} className='mt-2 text-sm text-gray-500'>{desc}</p>
              ))}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
