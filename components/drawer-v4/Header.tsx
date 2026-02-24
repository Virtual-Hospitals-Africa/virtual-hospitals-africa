import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export function Header({ children, className }: { children: ComponentChildren, className?: string }) {
  return (
    <h2 className={cls("font-['Inter:Semi_Bold',sans-serif] font-semibold leading-5.5 not-italic relative shrink-0 text-[#29313d] text-4 text-nowrap whitespace-pre z-2 pb-1", className)}>
      {children}
    </h2>
  )
}
