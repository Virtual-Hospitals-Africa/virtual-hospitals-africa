import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export default function FormGrid(
  { columns, children, className }: {
    columns: 2 | 3
    children: ComponentChildren
    className?: string
  },
) {
  return (
    <div
      className={cls(
        'grid w-full gap-4',
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
