import { useSignal } from '@preact/signals'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { getSidebarCollapsedCookie, toggleSidebar } from './useSidebarCollapsed.tsx'

export default function SidebarToggleButton() {
  const collapsed = useSignal<boolean>(getSidebarCollapsedCookie())

  function toggle() {
    const next = !collapsed.value
    collapsed.value = next
    toggleSidebar(next)
  }

  return (
    <button
      id='sidebar-toggle-button'
      type='button'
      onClick={toggle}
      className='absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none'
      aria-label={collapsed.value ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed.value ? <ChevronRightIcon className='w-3 h-3' /> : <ChevronLeftIcon className='w-3 h-3' />}
    </button>
  )
}
