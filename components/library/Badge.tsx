import { ComponentChild } from 'preact'
import cls from '../../util/cls.ts'

export type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple'

export type BadgeProps = {
  content: number | string | ComponentChild
  color?: BadgeColor
  round?: 'md' | 'lg'
  classNames?: string
}

const badgeStyles: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
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
