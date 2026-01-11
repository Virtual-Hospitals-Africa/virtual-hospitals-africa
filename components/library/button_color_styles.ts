export type ColorName =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'error'
  | 'warning'
  | 'blue'
  | 'teal'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'neutral'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'hyperlink'
  | 'destructive'
  | 'ghost'

export const get_color_styles = (
  color: ColorName,
  variant: ButtonVariant,
): string => {
  if (variant === 'ghost') {
    const ghost_colors: Record<ColorName, string> = {
      primary: 'hover:text-primary focus-visible:text-primary',
      secondary: 'hover:text-primary-secondary focus-visible:text-primary-secondary',
      tertiary: 'hover:text-primary-tertiary focus-visible:text-primary-tertiary',
      success: 'hover:text-success-status focus-visible:text-success-status',
      error: 'hover:text-error-status focus-visible:text-error-status',
      warning: 'hover:text-warning-status focus-visible:text-warning-status',
      blue: 'hover:text-accent-blue-textIcon focus-visible:text-accent-blue-textIcon',
      teal: 'hover:text-accent-teal-textIcon focus-visible:text-accent-teal-textIcon',
      pink: 'hover:text-accent-pink-textIcon focus-visible:text-accent-pink-textIcon',
      purple: 'hover:text-accent-purple-textIcon focus-visible:text-accent-purple-textIcon',
      orange: 'hover:text-accent-orange-status focus-visible:text-accent-orange-status',
      neutral: 'hover:text-neutral-primary focus-visible:text-neutral-primary',
    }
    return ghost_colors[color] || ''
  }

  if (variant === 'primary' || variant === 'destructive') {
    const solid_colors: Record<ColorName, string> = {
      primary: 'bg-primary text-primary-onBrand hover:bg-primary-secondary focus-visible:outline-primary active:bg-primary-secondary disabled:hover:bg-primary',
      secondary:
        'bg-primary-secondary text-primary-onBrand hover:bg-primary focus-visible:outline-primary-secondary active:bg-primary disabled:hover:bg-primary-secondary',
      tertiary:
        'bg-primary-tertiary text-primary hover:bg-primary-secondary focus-visible:outline-primary-tertiary active:bg-primary-secondary disabled:hover:bg-primary-tertiary',
      success:
        'bg-success-status text-white hover:bg-success-textIcon focus-visible:outline-success-status active:bg-success-textIcon disabled:hover:bg-success-status',
      error: 'bg-error-status text-white hover:bg-error-textIcon focus-visible:outline-error-status active:bg-error-textIcon disabled:hover:bg-error-status',
      warning:
        'bg-warning-status text-white hover:bg-warning-textIcon focus-visible:outline-warning-status active:bg-warning-textIcon disabled:hover:bg-warning-status',
      blue:
        'bg-accent-blue-textIcon text-white hover:bg-accent-blue-bg hover:text-accent-blue-textIcon focus-visible:outline-accent-blue-textIcon active:bg-accent-blue-bg active:text-accent-blue-textIcon disabled:hover:bg-accent-blue-textIcon disabled:hover:text-white',
      teal:
        'bg-accent-teal-textIcon text-white hover:bg-accent-teal-bg hover:text-accent-teal-textIcon focus-visible:outline-accent-teal-textIcon active:bg-accent-teal-bg active:text-accent-teal-textIcon disabled:hover:bg-accent-teal-textIcon disabled:hover:text-white',
      pink:
        'bg-accent-pink-textIcon text-white hover:bg-accent-pink-bg hover:text-accent-pink-textIcon focus-visible:outline-accent-pink-textIcon active:bg-accent-pink-bg active:text-accent-pink-textIcon disabled:hover:bg-accent-pink-textIcon disabled:hover:text-white',
      purple:
        'bg-accent-purple-textIcon text-white hover:bg-accent-purple-bg hover:text-accent-purple-textIcon focus-visible:outline-accent-purple-textIcon active:bg-accent-purple-bg active:text-accent-purple-textIcon disabled:hover:bg-accent-purple-textIcon disabled:hover:text-white',
      orange:
        'bg-accent-orange-status text-white hover:bg-accent-orange-textIcon focus-visible:outline-accent-orange-status active:bg-accent-orange-textIcon disabled:hover:bg-accent-orange-status',
      neutral:
        'bg-neutral-primary text-white hover:bg-neutral-secondary focus-visible:outline-neutral-primary active:bg-neutral-secondary disabled:hover:bg-neutral-primary',
    }
    return solid_colors[color] || ''
  }

  if (variant === 'secondary') {
    const outlined_colors: Record<ColorName, string> = {
      primary:
        'border-primary-tertiary bg-primary-tertiary text-primary hover:border-primary-secondary hover:bg-primary-secondary focus-visible:outline-primary active:bg-primary disabled:hover:border-primary-tertiary disabled:hover:bg-primary-tertiary',
      secondary:
        'border-primary-secondary bg-primary-tertiary text-primary-secondary hover:border-primary hover:bg-primary-secondary focus-visible:outline-primary-secondary active:bg-primary disabled:hover:border-primary-secondary disabled:hover:bg-primary-tertiary',
      tertiary:
        'border-primary-tertiary bg-primary-tertiary text-primary hover:border-primary-secondary hover:bg-primary-secondary focus-visible:outline-primary-tertiary active:bg-primary-secondary disabled:hover:border-primary-tertiary disabled:hover:bg-primary-tertiary',
      success:
        'border-success-bg bg-success-bg text-success-textIcon hover:border-success-status hover:bg-success-status hover:text-white focus-visible:outline-success-status active:bg-success-status active:text-white disabled:hover:border-success-bg disabled:hover:bg-success-bg disabled:hover:text-success-textIcon',
      error:
        'border-error-bg bg-error-bg text-error-textIcon hover:border-error-status hover:bg-error-status hover:text-white focus-visible:outline-error-status active:bg-error-status active:text-white disabled:hover:border-error-bg disabled:hover:bg-error-bg disabled:hover:text-error-textIcon',
      warning:
        'border-warning-bg bg-warning-bg text-warning-textIcon hover:border-warning-status hover:bg-warning-status hover:text-white focus-visible:outline-warning-status active:bg-warning-status active:text-white disabled:hover:border-warning-bg disabled:hover:bg-warning-bg disabled:hover:text-warning-textIcon',
      blue:
        'border-accent-blue-bg bg-accent-blue-bg text-accent-blue-textIcon hover:border-accent-blue-textIcon hover:bg-accent-blue-textIcon hover:text-white focus-visible:outline-accent-blue-textIcon active:bg-accent-blue-textIcon active:text-white disabled:hover:border-accent-blue-bg disabled:hover:bg-accent-blue-bg disabled:hover:text-accent-blue-textIcon',
      teal:
        'border-accent-teal-bg bg-accent-teal-bg text-accent-teal-textIcon hover:border-accent-teal-textIcon hover:bg-accent-teal-textIcon hover:text-white focus-visible:outline-accent-teal-textIcon active:bg-accent-teal-textIcon active:text-white disabled:hover:border-accent-teal-bg disabled:hover:bg-accent-teal-bg disabled:hover:text-accent-teal-textIcon',
      pink:
        'border-accent-pink-bg bg-accent-pink-bg text-accent-pink-textIcon hover:border-accent-pink-textIcon hover:bg-accent-pink-textIcon hover:text-white focus-visible:outline-accent-pink-textIcon active:bg-accent-pink-textIcon active:text-white disabled:hover:border-accent-pink-bg disabled:hover:bg-accent-pink-bg disabled:hover:text-accent-pink-textIcon',
      purple:
        'border-accent-purple-bg bg-accent-purple-bg text-accent-purple-textIcon hover:border-accent-purple-textIcon hover:bg-accent-purple-textIcon hover:text-white focus-visible:outline-accent-purple-textIcon active:bg-accent-purple-textIcon active:text-white disabled:hover:border-accent-purple-bg disabled:hover:bg-accent-purple-bg disabled:hover:text-accent-purple-textIcon',
      orange:
        'border-accent-orange-bg bg-accent-orange-bg text-accent-orange-textIcon hover:border-accent-orange-status hover:bg-accent-orange-status hover:text-white focus-visible:outline-accent-orange-status active:bg-accent-orange-status active:text-white disabled:hover:border-accent-orange-bg disabled:hover:bg-accent-orange-bg disabled:hover:text-accent-orange-textIcon',
      neutral:
        'border-neutral-tertiary bg-neutral-tertiary text-neutral-primary hover:border-neutral-secondary hover:bg-neutral-secondary focus-visible:outline-neutral-primary active:bg-neutral-secondary disabled:hover:border-neutral-tertiary disabled:hover:bg-neutral-tertiary',
    }
    return outlined_colors[color] || ''
  }

  if (variant === 'tertiary') {
    const tertiary_colors: Record<ColorName, string> = {
      primary:
        'bg-primary-tertiary text-primary hover:bg-primary-secondary hover:text-white focus-visible:outline-primary-tertiary active:bg-primary-secondary active:text-white disabled:hover:bg-primary-tertiary disabled:hover:text-primary',
      secondary:
        'bg-primary-tertiary text-primary-secondary hover:bg-primary-secondary hover:text-white focus-visible:outline-primary-secondary active:bg-primary-secondary active:text-white disabled:hover:bg-primary-tertiary disabled:hover:text-primary-secondary',
      tertiary:
        'bg-primary-tertiary text-primary hover:bg-primary-secondary hover:text-white focus-visible:outline-primary-tertiary active:bg-primary-secondary active:text-white disabled:hover:bg-primary-tertiary disabled:hover:text-primary',
      success:
        'bg-success-bg text-success-textIcon hover:bg-success-status hover:text-white focus-visible:outline-success-status active:bg-success-status active:text-white disabled:hover:bg-success-bg disabled:hover:text-success-textIcon',
      error:
        'bg-error-bg text-error-textIcon hover:bg-error-status hover:text-white focus-visible:outline-error-status active:bg-error-status active:text-white disabled:hover:bg-error-bg disabled:hover:text-error-textIcon',
      warning:
        'bg-warning-bg text-warning-textIcon hover:bg-warning-status hover:text-white focus-visible:outline-warning-status active:bg-warning-status active:text-white disabled:hover:bg-warning-bg disabled:hover:text-warning-textIcon',
      blue:
        'bg-accent-blue-bg text-accent-blue-textIcon hover:bg-accent-blue-textIcon hover:text-white focus-visible:outline-accent-blue-textIcon active:bg-accent-blue-textIcon active:text-white disabled:hover:bg-accent-blue-bg disabled:hover:text-accent-blue-textIcon',
      teal:
        'bg-accent-teal-bg text-accent-teal-textIcon hover:bg-accent-teal-textIcon hover:text-white focus-visible:outline-accent-teal-textIcon active:bg-accent-teal-textIcon active:text-white disabled:hover:bg-accent-teal-bg disabled:hover:text-accent-teal-textIcon',
      pink:
        'bg-accent-pink-bg text-accent-pink-textIcon hover:bg-accent-pink-textIcon hover:text-white focus-visible:outline-accent-pink-textIcon active:bg-accent-pink-textIcon active:text-white disabled:hover:bg-accent-pink-bg disabled:hover:text-accent-pink-textIcon',
      purple:
        'bg-accent-purple-bg text-accent-purple-textIcon hover:bg-accent-purple-textIcon hover:text-white focus-visible:outline-accent-purple-textIcon active:bg-accent-purple-textIcon active:text-white disabled:hover:bg-accent-purple-bg disabled:hover:text-accent-purple-textIcon',
      orange:
        'bg-accent-orange-bg text-accent-orange-textIcon hover:bg-accent-orange-status hover:text-white focus-visible:outline-accent-orange-status active:bg-accent-orange-status active:text-white disabled:hover:bg-accent-orange-bg disabled:hover:text-accent-orange-textIcon',
      neutral:
        'bg-neutral-tertiary text-neutral-primary hover:bg-neutral-secondary hover:text-white focus-visible:outline-neutral-primary active:bg-neutral-secondary active:text-white disabled:hover:bg-neutral-tertiary disabled:hover:text-neutral-primary',
    }
    return tertiary_colors[color] || ''
  }

  if (variant === 'hyperlink') {
    const hyperlink_colors: Record<ColorName, string> = {
      primary:
        'border-background-border bg-background-primary text-primary hover:border-primary hover:bg-primary-tertiary focus-visible:outline-primary active:border-primary-secondary active:bg-primary-secondary active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      secondary:
        'border-background-border bg-background-primary text-primary-secondary hover:border-primary-secondary hover:bg-primary-tertiary focus-visible:outline-primary-secondary active:border-primary active:bg-primary-secondary active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      tertiary:
        'border-background-border bg-background-primary text-primary-tertiary hover:border-primary-tertiary hover:bg-primary-tertiary focus-visible:outline-primary-tertiary active:border-primary-secondary active:bg-primary-secondary active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      success:
        'border-background-border bg-background-primary text-success-status hover:border-success-status hover:bg-success-bg focus-visible:outline-success-status active:border-success-textIcon active:bg-success-status active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      error:
        'border-background-border bg-background-primary text-error-status hover:border-error-status hover:bg-error-bg focus-visible:outline-error-status active:border-error-textIcon active:bg-error-status active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      warning:
        'border-background-border bg-background-primary text-warning-status hover:border-warning-status hover:bg-warning-bg focus-visible:outline-warning-status active:border-warning-textIcon active:bg-warning-status active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      blue:
        'border-background-border bg-background-primary text-accent-blue-textIcon hover:border-accent-blue-textIcon hover:bg-accent-blue-bg focus-visible:outline-accent-blue-textIcon active:border-accent-blue-textIcon active:bg-accent-blue-textIcon active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      teal:
        'border-background-border bg-background-primary text-accent-teal-textIcon hover:border-accent-teal-textIcon hover:bg-accent-teal-bg focus-visible:outline-accent-teal-textIcon active:border-accent-teal-textIcon active:bg-accent-teal-textIcon active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      pink:
        'border-background-border bg-background-primary text-accent-pink-textIcon hover:border-accent-pink-textIcon hover:bg-accent-pink-bg focus-visible:outline-accent-pink-textIcon active:border-accent-pink-textIcon active:bg-accent-pink-textIcon active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      purple:
        'border-background-border bg-background-primary text-accent-purple-textIcon hover:border-accent-purple-textIcon hover:bg-accent-purple-bg focus-visible:outline-accent-purple-textIcon active:border-accent-purple-textIcon active:bg-accent-purple-textIcon active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      orange:
        'border-background-border bg-background-primary text-accent-orange-status hover:border-accent-orange-status hover:bg-accent-orange-bg focus-visible:outline-accent-orange-status active:border-accent-orange-textIcon active:bg-accent-orange-status active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
      neutral:
        'border-background-border bg-background-primary text-neutral-primary hover:border-neutral-secondary hover:bg-neutral-tertiary focus-visible:outline-neutral-primary active:border-neutral-primary active:bg-neutral-secondary active:text-white disabled:hover:border-background-border disabled:hover:bg-background-primary',
    }
    return hyperlink_colors[color] || ''
  }

  return ''
}
