import { useSignal } from '@preact/signals'
import { ComponentChildren } from 'preact'
import { ChevronDownIcon, ChevronUpIcon } from '../components/library/icons/heroicons/outline.tsx'
import cls from '../util/cls.ts'

// On mobile the drawer stacks above the page content. Its patient card stays
// visible and this folds the rest of the drawer away beneath it. From md up the
// drawer is a side column that is always open, so the toggle disappears and the
// contents are always shown.
export function DrawerCollapsible({ children }: { children: ComponentChildren }) {
  const open = useSignal(false)

  return (
    <>
      <button
        id='patient-drawer-toggle'
        type='button'
        aria-expanded={open.value}
        aria-controls='patient-drawer-collapsible'
        onClick={() => {
          open.value = !open.value
        }}
        className='md:hidden flex w-full items-center justify-center gap-1 border-b border-gray-200 py-1 text-xs text-gray-600'
      >
        {open.value
          ? (
            <>
              Hide patient details <ChevronUpIcon className='w-3 h-3' />
            </>
          )
          : (
            <>
              Show patient details <ChevronDownIcon className='w-3 h-3' />
            </>
          )}
      </button>
      <div
        id='patient-drawer-collapsible'
        className={cls(
          'flex-col gap-2.5 md:flex',
          open.value ? 'flex' : 'hidden',
        )}
      >
        {children}
      </div>
    </>
  )
}
