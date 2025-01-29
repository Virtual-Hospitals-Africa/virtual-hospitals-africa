import { JSX } from 'preact'
import cls from '../../util/cls.ts'
import { assert } from 'std/assert/assert.ts'

const baseStyles = {
  solid: 'shadow-sm py-1 px-4',
  outline: 'border py-1 px-4',
  ghost: 'hover:text-blue-600 focus-visible:text-blue-600',
}

const sizeStyles = {
  sm: 'text-base/6',
  md: 'text-base',
}

const variantStyles = {
  solid: {
    primary:
      'rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
    slate:
      'bg-slate-900 text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:bg-slate-700 active:text-white/80 disabled:opacity-30 disabled:hover:bg-slate-900',
    blue:
      'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-700 active:text-white/80 disabled:opacity-30 disabled:hover:bg-blue-600',
    indigo:
      'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700 active:text-white/80 disabled:opacity-30 disabled:hover:bg-indigo-600',
    white:
      'bg-white text-blue-600 hover:text-blue-700 focus-visible:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-blue-50 active:text-blue-900/80 disabled:opacity-40 disabled:hover:text-blue-600',
  },
  outline: {
    slate:
      'border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:border-slate-200 active:bg-slate-50 active:text-slate-900/70 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent',
    blue:
      'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:text-blue-600/70 disabled:opacity-40 disabled:hover:border-blue-300 disabled:hover:bg-transparent',
    blueTwo:
      'border-slate-500 text-slate-900 px-1 py-1 text-xl font-extrabold hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:text-blue-600/70 disabled:opacity-40 disabled:hover:border-blue-300 disabled:hover:bg-transparent',
    gray:
      'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 active:text-gray-600/70 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-transparent',
  },
  ghost: {},
}

type ButtonProps =
  & JSX.ButtonHTMLAttributes<HTMLButtonElement>
  & {
    className?: string
    href?: string
    action?: string
    method?: 'GET' | 'POST'
    size?: 'sm' | 'md'
  }
  & ({
    variant: 'solid'
    color?: keyof typeof variantStyles.solid
  } | {
    variant: 'outline'
    color?: keyof typeof variantStyles.outline
  } | {
    variant: 'ghost'
    color?: undefined
  } | {
    variant?: undefined
    color?: keyof typeof variantStyles.solid
  })

export function Button({
  variant = 'solid',
  color = 'primary',
  size = 'md',
  className,
  href,
  action,
  method,
  type = 'submit',
  ...props
}: ButtonProps) {
  className = cls(
    'inline-flex justify-center rounded-md font-semibold tracking-tight focus:outline-none',
    baseStyles[variant],
    // deno-lint-ignore no-explicit-any
    (variantStyles as any)[variant][color],
    sizeStyles[size],
    className,
  )

  if (method === 'POST') {
    assert(action, 'inline form submit button must have action')
    assert(
      type === 'submit',
      'inline form submit button must be of type sybmit',
    )

    return (
      <form method='POST' action={action}>
        <button className={className} type='submit' {...props} />
      </form>
    )
  }

  return href
    ? (
      <a
        href={href}
        className={className}
        {...(props as unknown as JSX.HTMLAttributes<HTMLAnchorElement>)}
      />
    )
    : <button className={className} type={type} {...props} />
}
