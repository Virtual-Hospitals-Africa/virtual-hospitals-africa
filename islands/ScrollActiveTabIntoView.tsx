import { ComponentChildren } from 'preact'
import { useLayoutEffect, useRef } from 'preact/hooks'

export function ScrollActiveTabIntoView(
  { className, children }: { className: string; children: ComponentChildren },
) {
  const nav_ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const nav = nav_ref.current
    if (!nav) return
    const overflow_x = getComputedStyle(nav).overflowX
    if (overflow_x !== 'auto' && overflow_x !== 'scroll') return
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]')
    if (!active) return

    const nav_box = nav.getBoundingClientRect()
    const active_box = active.getBoundingClientRect()
    const hidden_left = nav_box.left - active_box.left
    const hidden_right = active_box.right - nav_box.right
    if (hidden_left > 0) nav.scrollLeft -= hidden_left
    else if (hidden_right > 0) nav.scrollLeft += hidden_right
  }, [])

  return (
    <nav ref={nav_ref} className={className}>
      {children}
    </nav>
  )
}
