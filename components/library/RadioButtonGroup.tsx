import cls from '../../util/cls.ts'
import { ComponentChildren, InputEventHandler } from 'preact'

type Option = {
  id: string
  name: string
  description: string | string[] | ComponentChildren
}

type RadioInputProps = {
  name: string
  option: Option
  defaultValue?: string
  onInput?: InputEventHandler<HTMLInputElement>
}

function RadioInput({ name, defaultValue, option, className, onInput }: RadioInputProps & { className: string }) {
  return (
    <input
      defaultChecked={option.id === defaultValue}
      id={option.id}
      name={name}
      type='radio'
      value={option.id}
      aria-describedby={`${option.id}-description`}
      className={className}
      onInput={onInput}
    />
  )
}

function Description({ option }: { option: Option }) {
  return (
    <div id={`${option.id}-description`}>
      <span className='text-md font-medium leading-6 text-gray-600'>
        {option.name}
      </span>
      {(Array.isArray(option.description) ? option.description : [option.description]).map((desc, i) => (
        typeof desc === 'string'
          ? (
            <p
              key={i}
              className='text-sm leading-5 text-gray-600'
            >
              {desc}
            </p>
          )
          : desc
      ))}
    </div>
  )
}

function PanelWithBorderOption(props: RadioInputProps) {
  return (
    <label className='relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus-within:outline-none hover:border-indigo-600 hover:ring-2 hover:ring-indigo-600 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 border-gray-300'>
      <RadioInput {...props} className='sr-only' />
      <span className='flex flex-col gap-2'>
        <Description option={props.option} />
        <span
          className='pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent has-checked:border-indigo-600'
          aria-hidden='true'
        />
      </span>
    </label>
  )
}

function RadioButtonOption(props: RadioInputProps) {
  return (
    <div className='flex items-start gap-3'>
      <div className='flex items-center pt-1.5'>
        <RadioInput
          {...props}
          className='bg-white border border-gray-300 rounded-full appearance-none size-4 checked:border-indigo-700 checked:bg-white checked:ring-4 checked:ring-indigo-700 checked:ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700'
        />
      </div>
      <span className='flex flex-col gap-2'>
        <label htmlFor={props.option.id}>
          <Description option={props.option} />
        </label>
      </span>
    </div>
  )
}

export function RadioButtonGroup({ options, name, defaultValue, orientation = 'vertical', variant = 'circular-button', onInput }: {
  options: Option[]
  name: string
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'circular-button' | 'panel-with-border'
  onInput?: InputEventHandler<HTMLInputElement>
}) {
  const Option = variant === 'circular-button' ? RadioButtonOption : PanelWithBorderOption

  return (
    <fieldset>
      <div
        className={cls('flex', {
          'gap-4.5': variant === 'circular-button',
          'gap-2': variant === 'panel-with-border',
          'flex-col': orientation === 'vertical',
          'flex-row': orientation === 'horizontal',
        })}
      >
        {options.map((option) => (
          <Option
            key={option.id}
            option={option}
            name={name}
            defaultValue={defaultValue}
            onInput={onInput}
          />
        ))}
      </div>
    </fieldset>
  )
}
