import { Signal } from '@preact/signals'
import { ComponentChildren } from 'preact'
import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import { LabeledInput, LabeledInputProps } from './labelled.tsx'

export type WrapperInputProps<
  El extends HTMLElement,
  Value,
> = LabeledInputProps<El> & {
  inputClassName?: string
  value?: Maybe<Value>
  signal?: Signal<Value>
}

export type InputProps =
  & WrapperInputProps<HTMLInputElement, string | number>
  & {
    id?: string
    type?: 'text' | 'email' | 'tel' | 'date'
    placeholder?: string
    pattern?: string
    onKeyDown?: (event: KeyboardEvent) => void
    characterCountLimit?: number
    leftIcon?: ComponentChildren
    rightIcon?: ComponentChildren
    suffix?: string
    guidanceText?: string
    errorText?: string
    size?: InputSize
  }
  & (
    | {
      inputmode?: undefined
      min?: undefined
      max?: undefined
    }
    | {
      inputmode: 'numeric'
      min?: number
      max?: number
    }
    | {
      type: 'date'
      inputmode?: undefined
      min?: Maybe<string>
      max?: Maybe<string>
    }
  )

type InputSize = 'normal' | 'large' | 'small'

export function InternalInput({
  name,
  id,
  type,
  label,
  placeholder,
  required,
  signal,
  value,
  onInput,
  onFocus,
  onBlur,
  onKeyDown,
  disabled,
  readonly,
  pattern,
  className,
  inputClassName,
  characterCountLimit,
  leftIcon,
  rightIcon,
  suffix,
  guidanceText,
  errorText,
  // TODO: implement size variants
  // size = "normal",
  inputmode,
  min,
  max,
}: InputProps) {
  assert(!characterCountLimit)
  assert(!rightIcon || !suffix)

  return (
    <>
      <LabeledInput
        name={name}
        label={label}
        required={required}
        className={cls('w-full flex-1', className)}
      >
        <div className='grid grid-cols-1'>
          {leftIcon && (
            <div
              aria-hidden='true'
              className='self-center col-start-1 row-start-1 mr-3 text-red-500 pointer-events-none size-5 justify-self-end sm:size-4 dark:text-red-400'
            >
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            {...(name && { name })}
            className={cls(
              'col-start-1 row-start-1 h-12 block w-full rounded-md bg-white py-1.5 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:pr-9 sm:text-sm/6 dark:bg-white/5',
              inputClassName,
              disabled && 'bg-gray-300',
              !!leftIcon && 'pl-3',
              !!rightIcon && 'pr-3',
              errorText
                ? 'text-red-900 outline-red-300 focus:outline-red-600  dark:outline-red-500/50 dark:text-red-400 dark:placeholder:text-red-400/70 dark:focus:outline-red-400'
                : 'text-black-900 dark:focus:text-black-900', // TODO
            )}
            inputmode={inputmode}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readonly={readonly}
            value={signal?.value || value || undefined}
            onInput={(event) => {
              if (signal) signal.value = event.currentTarget.value
              onInput?.(event)
              event.currentTarget.setCustomValidity('')
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            pattern={pattern}
            autoComplete='off'
            min={min ?? undefined}
            max={max ?? undefined}
          />
          {suffix && (
            <div
              id='price-currency'
              className='self-center col-start-1 row-start-1 mr-3 text-base text-gray-500 pointer-events-none select-none justify-self-end sm:text-sm/6 dark:text-gray-400'
            >
              {suffix}
            </div>
          )}
          {rightIcon && (
            <div
              aria-hidden='true'
              className='self-center col-start-1 row-start-1 mr-3 text-red-500 pointer-events-none size-5 justify-self-end sm:size-4 dark:text-red-400'
            >
              {rightIcon}
            </div>
          )}
        </div>
      </LabeledInput>
      {errorText
        ? <span className='text-red-400'>{errorText}</span>
        : guidanceText
        ? <span className='text-gray-400'>{guidanceText}</span>
        : null}
    </>
  )
}
