import { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentChild, type JSX } from 'preact'
import cls from '../../util/cls.ts'

type FigmaVariant =
  | 'outlined-indigo'
  | 'fill-grey'
  | 'icon-fill'
  | 'outline-grey-fill-indigo'

type LegacyVariant =
  | 'secondary'
  | 'ghost'
  | 'tertiary'

type Variant = FigmaVariant | LegacyVariant

type ColorName = 'blue' | 'slate'

type HeroIconButtonProps =
  & ButtonHTMLAttributes<HTMLButtonElement>
  & {
    className?: string
    href?: string
    onClick?(event: JSX.TargetedEvent<HTMLButtonElement>): void
    type?: 'submit' | 'button' | 'reset'
    variant?: Variant
    color?: ColorName
    selected?: boolean
    warning?: boolean
    children?: ComponentChild
  }

const get_legacy_variant_styles = (
  variant: LegacyVariant,
  color?: ColorName,
): string => {
  switch (variant) {
    case 'secondary':
      if (color === 'blue') {
        return 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-200 disabled:opacity-40 disabled:hover:border-indigo-200 disabled:hover:bg-indigo-50'
      }
      if (color === 'slate') {
        return 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-200 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-slate-50'
      }
      return 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-200 disabled:opacity-40 disabled:hover:border-indigo-200 disabled:hover:bg-indigo-50'
    case 'ghost':
      return 'hover:text-blue-600 focus-visible:text-blue-600'
    case 'tertiary':
      return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 active:bg-gray-400 disabled:opacity-40 disabled:hover:bg-gray-200'
    default:
      return ''
  }
}

const get_figma_variant_styles = (
  variant: FigmaVariant,
  selected: boolean,
  warning: boolean,
): string => {
  if (warning && selected) {
    return 'bg-error-status flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-status'
  }

  if (selected) {
    return 'bg-primary-secondary flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
  }

  switch (variant) {
    case 'outlined-indigo':
      return 'bg-background-primary border border-primary-secondary flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
    case 'fill-grey':
      return 'bg-background-base border border-background-border flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
    case 'icon-fill':
      return 'flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
    case 'outline-grey-fill-indigo':
      return 'bg-background-primary border border-background-border flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
    default:
      return 'flex items-center justify-center p-3 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-secondary'
  }
}

const get_variant_styles = (
  variant: Variant,
  selected: boolean,
  warning: boolean,
  color?: ColorName,
): string => {
  const base_styles = 'flex items-center justify-center focus:outline-none'

  // Legacy variants (secondary, ghost, tertiary)
  if (
    variant === 'secondary' || variant === 'ghost' || variant === 'tertiary'
  ) {
    return cls(base_styles, get_legacy_variant_styles(variant, color))
  }

  // Figma variants
  return cls(
    base_styles,
    get_figma_variant_styles(variant as FigmaVariant, selected, warning),
  )
}

export function HeroIconButton({
  variant = 'outlined-indigo',
  selected = false,
  warning = false,
  color,
  className,
  href,
  type = 'button',
  children,
  ...props
}: HeroIconButtonProps) {
  className = cls(
    get_variant_styles(variant, selected, warning, color),
    className,
  )

  return href
    ? (
      <a
        href={href}
        className={className}
        {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
    : (
      <button className={className} type={type} {...props}>
        {children}
      </button>
    )
}
