import { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentChild } from 'preact'
import { assert } from 'std/assert/assert.ts'
import cls from '../../util/cls.ts'
import last from '../../util/last.ts'

const size_styles = {
  sm: 'h-8 px-3 text-sm leading-6',
  md: 'h-9 px-4 text-base leading-6',
  lg: 'h-10 px-5 text-lg leading-6',
  xl: 'h-11 px-6 text-xl leading-6',
}

const variant_styles = {
  primary:
    'bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800 disabled:opacity-40 disabled:hover:bg-indigo-600',
  secondary:
    'border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-200 disabled:opacity-40 disabled:hover:border-indigo-200 disabled:hover:bg-indigo-50',
  tertiary:
    'bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 active:bg-gray-400 disabled:opacity-40 disabled:hover:bg-gray-200',
  hyperlink:
    'border border-gray-300 bg-white text-indigo-600 font-semibold rounded-lg hover:border-indigo-600 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:border-indigo-700 active:bg-indigo-100 disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white',
  destructive:
    'bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:opacity-40 disabled:hover:bg-red-600',
  ghost: 'hover:text-blue-600 focus-visible:text-blue-600 !p-0',
}

export type ButtonLinkProps =
  | {
    href?: never
    action: string
    method: 'POST'
    type: 'submit'
  }
  | {
    href?: string
    action?: never
    method?: never
  }

export type ButtonProps =
  & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>
  & {
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: keyof typeof variant_styles
    left_icon?: ComponentChild
    right_icon?: ComponentChild
  }
  & ButtonLinkProps

export type ButtonVariant = NonNullable<ButtonProps['variant']>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  href,
  action,
  method,
  type = 'submit',
  left_icon,
  right_icon,
  children,
  ...props
}: ButtonProps) {
  className = cls(
    'inline-flex items-center tracking-tight focus:outline-none flex gap-1',
    variant_styles[variant],
    size_styles[size],
    variant !== 'ghost' && 'justify-center',
    !!(left_icon || right_icon) && 'gap-1.5',
    className,
  )

  const content = (
    <>
      {left_icon && <span className='-ml-1'>{left_icon}</span>}
      {children}
      {right_icon && <span className='-mr-1'>{right_icon}</span>}
    </>
  )

  if (method === 'POST') {
    assert(action, 'inline form submit button must have action')
    assert(
      type === 'submit',
      'inline form submit button must be of type submit',
    )

    const id = last(action.split('/'))!

    return (
      <form method='POST' action={action} id={id}>
        <button className={className} type='submit' {...props}>
          {content}
        </button>
      </form>
    )
  }

  return href
    ? (
      <a
        href={href}
        className={className}
        {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
    : (
      <button className={className} type={type} {...props}>
        {content}
      </button>
    )
}
