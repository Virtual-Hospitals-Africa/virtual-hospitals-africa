import { ComponentChild } from 'preact'
import cls from '../../util/cls.ts'

export type BadgeColor = 'gray' | 'red' | 'yellow' | 'green'

export type BadgeProps = {
  content: number | string | ComponentChild
  color?: BadgeColor
  round?: 'md' | 'lg'
  classNames?: string
}

const badgeStyles: Record<BadgeColor, string> = {
  gray: 'bg-gray-50 text-gray-500',
  red: 'bg-red-50 text-red-500',
  yellow: 'bg-yellow-50 text-yellow-500',
  green: 'bg-green-50 text-green-500',
}

export default function Badge(
  { content, color = 'gray', round = 'lg', classNames }: BadgeProps,
) {
  return (
    <div
      className={cls(
        'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium',
        badgeStyles[color],
        {
          'rounded-full': round === 'lg',
          'rounded-md': round === 'md',
        },
        classNames,
      )}
    >
      {content}
    </div>
  )
}
