import { ComponentChildren } from 'preact'
import { useLayoutEffect, useRef } from 'preact/hooks'

export function ScrollActiveTabIntoView(
  { className, children, 'aria-label': aria_label }: {
    className: string
    children: ComponentChildren
    'aria-label'?: string
  },
) {
  const nav_ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const nav = nav_ref.current
    if (!nav) return

    function scrollActiveIntoView() {
      const current = nav_ref.current
      if (!current) return
      const overflow_x = getComputedStyle(current).overflowX
      if (overflow_x !== 'auto' && overflow_x !== 'scroll') return
      const active = current.querySelector<HTMLElement>('[aria-current="page"]')
      if (!active) return

      const nav_box = current.getBoundingClientRect()
      const active_box = active.getBoundingClientRect()
      const hidden_left = nav_box.left - active_box.left
      const hidden_right = active_box.right - nav_box.right
      if (hidden_left > 0) current.scrollLeft -= hidden_left
      else if (hidden_right > 0) current.scrollLeft += hidden_right
    }

    scrollActiveIntoView()
    self.addEventListener('resize', scrollActiveIntoView)
    return () => self.removeEventListener('resize', scrollActiveIntoView)
  }, [])

  return (
    <nav ref={nav_ref} className={className} aria-label={aria_label}>
      {children}
    </nav>
  )
}
