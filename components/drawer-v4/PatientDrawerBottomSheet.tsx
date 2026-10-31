import { useSignal } from '@preact/signals'
import { ComponentChildren, TargetedPointerEvent } from 'preact'
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { PRIORITY_UPDATE_EVENT } from '../../islands/DrawerPatientCard.tsx'
import { higherPriority, Priority, PRIORITY_COLORS } from '../../shared/priorities.ts'
import cls from '../../util/cls.ts'

const SWIPE_DISTANCE_PX = 48
const SWIPE_VELOCITY_PX_PER_MS = 0.45
const TAP_SLOP_PX = 8

type Drag = {
  pointer_id: number
  start_y: number
  start_time: number
  moved: boolean
}

// From md up the wrapper is display:contents, so the server-rendered patient
// drawer remains the desktop side column. Below md it is a fixed bottom sheet.
export function PatientDrawerBottomSheet(
  { patient_name, patient_detail, priority_name, children }: {
    patient_name: string | null
    patient_detail: string | null
    priority_name: Priority | null
    children: ComponentChildren
  },
) {
  const expanded = useSignal(false)
  const priority = useSignal(priority_name)
  const sheet_ref = useRef<HTMLDivElement>(null)
  const header_ref = useRef<HTMLButtonElement>(null)
  const details_ref = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const suppress_click = useRef(false)

  const priority_color = priority.value ? PRIORITY_COLORS[priority.value] : { bg: 'bg-gray-100', text: 'text-gray-800' }

  useEffect(() => {
    function listener(event: Event) {
      assert(event instanceof CustomEvent)
      const next_priority = higherPriority(event.detail.priority, priority.value)
      if (next_priority && next_priority !== priority.value) {
        priority.value = next_priority
      }
    }

    self.addEventListener(PRIORITY_UPDATE_EVENT, listener)
    return () => self.removeEventListener(PRIORITY_UPDATE_EVENT, listener)
  }, [])

  useLayoutEffect(() => {
    const header = header_ref.current
    if (!header) return

    const publish_collapsed_height = () => {
      if (expanded.value) return
      const height = Math.ceil(header.getBoundingClientRect().height)
      if (!height) return
      document.documentElement.style.setProperty('--patient-sheet-collapsed-height', `${height}px`)
    }

    publish_collapsed_height()
    const observer = new ResizeObserver(publish_collapsed_height)
    observer.observe(header)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--patient-sheet-collapsed-height')
    }
  }, [])

  useLayoutEffect(() => {
    const details = details_ref.current
    if (!details) return
    const desktop = globalThis.matchMedia('(min-width: 48rem)')
    const sync = () => {
      const conceal = !desktop.matches && !expanded.value
      if (conceal) details.setAttribute('inert', '')
      else details.removeAttribute('inert')
    }
    sync()
    desktop.addEventListener('change', sync)
    return () => desktop.removeEventListener('change', sync)
  }, [expanded.value])

  function cancelDrag(event: TargetedPointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointer_id !== event.pointerId) return
    drag.current = null
    if (!current.moved) return
    suppress_click.current = true
    queueMicrotask(() => {
      suppress_click.current = false
    })
  }

  function finishDrag(event: TargetedPointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointer_id !== event.pointerId) return
    drag.current = null
    const delta_y = event.clientY - current.start_y
    const moved = current.moved || Math.abs(delta_y) > TAP_SLOP_PX
    if (!moved) return

    suppress_click.current = true
    queueMicrotask(() => {
      suppress_click.current = false
    })

    const elapsed = Math.max(performance.now() - current.start_time, 1)
    const velocity = delta_y / elapsed
    if (velocity <= -SWIPE_VELOCITY_PX_PER_MS || delta_y <= -SWIPE_DISTANCE_PX) {
      expanded.value = true
      return
    }
    if (velocity >= SWIPE_VELOCITY_PX_PER_MS || delta_y >= SWIPE_DISTANCE_PX) {
      expanded.value = false
    }
  }

  function onPointerDown(event: TargetedPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    drag.current = {
      pointer_id: event.pointerId,
      start_y: event.clientY,
      start_time: performance.now(),
      moved: false,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Capture is unavailable for some pointers. The button still receives the gesture.
    }
  }

  function onPointerMove(event: TargetedPointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointer_id !== event.pointerId) return
    if (Math.abs(event.clientY - current.start_y) > TAP_SLOP_PX) current.moved = true
  }

  function onClick() {
    if (suppress_click.current) return
    expanded.value = !expanded.value
  }

  return (
    <div
      ref={sheet_ref}
      data-expanded={expanded.value ? 'true' : 'false'}
      className={cls(
        'patient-drawer-sheet md:contents',
        'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:flex max-md:flex-col max-md:overflow-hidden max-md:rounded-t-2xl',
        'max-md:shadow-[0_-8px_24px_rgba(30,27,24,0.12)]',
        expanded.value ? 'max-md:bg-white' : priority_color.bg,
      )}
    >
      <button
        ref={header_ref}
        id='patient-drawer-sheet-toggle'
        type='button'
        aria-expanded={expanded.value ? 'true' : 'false'}
        aria-controls='patient-drawer'
        aria-label={expanded.value ? 'Collapse patient details' : undefined}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
        className={cls(
          'md:hidden w-full shrink-0 touch-none cursor-pointer select-none border-0 bg-transparent p-0 text-left',
          !expanded.value && 'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <span className='flex justify-center pt-2.5 pb-2' aria-hidden='true'>
          <span className='block h-1 w-10 rounded-full bg-gray-900/25' />
        </span>
        {!expanded.value && (
          <span className='flex items-start justify-between gap-3 px-4 pb-3'>
            <span className='min-w-0'>
              <span className="block truncate font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold leading-6.5 text-gray-800">
                {patient_name || 'Unnamed patient'}
              </span>
              {patient_detail && (
                <span className='mt-0.5 block truncate text-xs text-[#29313d]'>
                  {patient_detail}
                </span>
              )}
            </span>
            <span
              className={cls(
                "shrink-0 font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold leading-6",
                priority_color.text,
              )}
            >
              {priority.value ?? 'Undetermined'}
            </span>
          </span>
        )}
      </button>
      <div
        ref={details_ref}
        className={cls(
          'md:contents max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col',
          expanded.value && 'max-md:pb-[env(safe-area-inset-bottom)]',
        )}
      >
        {children}
      </div>
    </div>
  )
}
