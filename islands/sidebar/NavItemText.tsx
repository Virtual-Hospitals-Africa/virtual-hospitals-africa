import { ComponentChild } from 'preact'
import cls from '../../util/cls.ts'
import { useSidebarCollapsed } from './useSidebarCollapsed.tsx'

export function SidebarNavItemText({ children }: { children: ComponentChild }) {
  const collapsed = useSidebarCollapsed()
  return (
    <span
      className={cls('overflow-hidden whitespace-nowrap inline-block transition-all duration-200', {
        'max-w-auto opacity-100 ml-3': !collapsed.value,
        'max-w-0 opacity-0 ml-0': collapsed.value,
      })}
    >
      {children}
    </span>
  )
}
