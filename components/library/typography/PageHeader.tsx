import { ComponentChildren } from 'preact'
import cls from '../../../util/cls.ts'

export default function PageHeader(
  { children, className }: { children: ComponentChildren; className?: string },
) {
  return (
    <h1
      className={cls(
        'text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2',
        className,
      )}
    >
      {children}
    </h1>
  )
}
