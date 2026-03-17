import { assert } from 'std/assert/assert.ts'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import isObjectLike from '../../util/isObjectLike.ts'

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
