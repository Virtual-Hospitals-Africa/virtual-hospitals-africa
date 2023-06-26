type BadgeColor = 'gray' | 'red' | 'yellow' | 'green'

export type BadgeProps = {
  content: number | string
  color?: BadgeColor
}

const badgeStyles: Record<BadgeColor, string> = {
  gray: 'bg-gray-50 text-gray-500',
  red: 'bg-red-50 text-red-500',
  yellow: 'bg-yellow-50 text-yellow-500',
  green: 'bg-green-50 text-green-500',
}

export default function Badge({ content, color = 'gray' }: BadgeProps) {
  return (
    <div
      className={`'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${badgeStyles[color]}`}
    >
      {content}
    </div>
  )
}
