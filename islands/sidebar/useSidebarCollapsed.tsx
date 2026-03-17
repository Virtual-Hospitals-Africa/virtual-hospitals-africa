import { assert } from 'std/assert/assert.ts'
import { useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import isObjectLike from '../../util/isObjectLike.ts'

function getSidebarCollapsedCookieServer(): boolean {
  assert(globalThis.Deno)
  // deno-lint-ignore no-explicit-any
  const Deno: any = globalThis.Deno
  const store = Deno.__local_storage__.getStore()
  return store.sidebar_collapsed
}

export function getSidebarCollapsedCookie(): boolean {
  if (typeof document === 'undefined') return getSidebarCollapsedCookieServer()
  const match = document.cookie.match(/(?:^|; )sidebar_collapsed=([^;]*)/)
  return match ? match[1] === 'true' : false
}

export function toggleSidebar(collapsed: boolean) {
  document.cookie = `sidebar_collapsed=${collapsed}; path=/; SameSite=Lax`
  self.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }))
}

export function useSidebarCollapsed() {
  const collapsed = useSignal<boolean>(
    getSidebarCollapsedCookie(),
  )

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
