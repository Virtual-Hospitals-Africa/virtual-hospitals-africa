import { ComponentChild } from 'preact'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../util/isObjectLike.ts'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/library/icons/heroicons/outline.tsx'
import { cls } from '../util/cls.ts'

export function toggleSidebar(collapsed: boolean) {
  if (collapsed) {
    globalThis.localStorage.setItem('sidebar_collapsed', 'true')
  } else {
    globalThis.localStorage.removeItem('sidebar_collapsed')
  }
  self.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }))
}

export function useSidebarCollapsed() {
  const collapsed = useSignal<boolean>(globalThis.localStorage.getItem('sidebar_collapsed') !== 'true')

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      assert(isObjectLike(event.detail))
      assert(typeof event.detail.collapsed === 'boolean')
      collapsed.value = event.detail.collapsed
    }
    self.addEventListener('sidebar-toggle', listener)
    return () => {
      self.removeEventListener('sidebar-toggle', listener)
    }
  }, [])

  return collapsed
}

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

export default function SidebarToggleButton() {
  const collapsed = useSignal<boolean>(false)

  function toggle() {
    const next = !collapsed.value
    collapsed.value = next
    toggleSidebar(next)
  }

  return (
    <button
      type='button'
      onClick={toggle}
      className='absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none'
      aria-label={collapsed.value ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed.value ? <ChevronRightIcon className='w-3 h-3' /> : <ChevronLeftIcon className='w-3 h-3' />}
    </button>
  )
}
