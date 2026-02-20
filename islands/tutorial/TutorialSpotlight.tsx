// =============================================================================
// FILE: /islands/tutorial/TutorialSpotlight.tsx
// Dark overlay with optional transparent "spotlight" cutout around target
// =============================================================================

import { useComputed, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import compact from '../../util/compact.ts'

type Props = {
  target?: string | string[] // Optional - if not provided, just shows dark overlay
  clickable?: boolean // Show pulsing amber border when true
}

const PADDING = 8
const BORDER_RADIUS = 12

/**
 * Dark overlay with optional spotlight cutout.
 * - No target: full dark overlay
 * - With target: dark overlay with cutout around target element
 */
export function TutorialSpotlight({ target, clickable = false }: Props) {
  const target_bounds = useSignal<DOMRect[]>([])
  const svg_ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!target) {
      target_bounds.value = []
      return
    }

    const targets = Array.isArray(target) ? target : [target]

    const getElements = () => targets.map((t) => Array.from(document.querySelectorAll(t)))

    function combinedBounds(elements: Element[][]): DOMRect[] {
      return compact(elements.map((els) => {
        if (els.length === 0) return null
        const rects = els.map((el) => el.getBoundingClientRect())
        const left = Math.min(...rects.map((r) => r.left))
        const top = Math.min(...rects.map((r) => r.top))
        const right = Math.max(...rects.map((r) => r.right))
        const bottom = Math.max(...rects.map((r) => r.bottom))
        return new DOMRect(left, top, right - left, bottom - top)
      }))
    }

    const updateBounds = () => {
      target_bounds.value = combinedBounds(getElements())
    }

    const elementNeedingScrollingIntoView = (): Element | undefined => {
      for (const elements of getElements()) {
        const [bounds] = combinedBounds([elements])
        const fills_page = bounds.height >= globalThis.innerHeight
        if (fills_page) return
        return elements[0]
      }
    }

    const scrollIntoViewIfNecessary = () => {
      const element = elementNeedingScrollingIntoView()
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    updateBounds()
    scrollIntoViewIfNecessary()

    const handleUpdate = () => requestAnimationFrame(updateBounds)
    self.addEventListener('scroll', handleUpdate, true)
    self.addEventListener('resize', handleUpdate)

    const observer = new ResizeObserver(handleUpdate)
    for (const element of getElements().flat()) {
      observer.observe(element)
    }

    return () => {
      self.removeEventListener('scroll', handleUpdate, true)
      self.removeEventListener('resize', handleUpdate)
      observer.disconnect()
    }
  }, [target])

  const cutout = useComputed(() =>
    target_bounds.value.map((bounds) => ({
      x: bounds.x - PADDING,
      y: bounds.y - PADDING,
      width: bounds.width + PADDING * 2,
      height: bounds.height + PADDING * 2,
    }))
  )

  const clipPath = clickable && cutout.value[0]
    ? `polygon(
        0% 0%, 0% 100%,
        ${cutout.value[0].x}px 100%,
        ${cutout.value[0].x}px ${cutout.value[0].y}px,
        ${cutout.value[0].x + cutout.value[0].width}px ${cutout.value[0].y}px,
        ${cutout.value[0].x + cutout.value[0].width}px ${cutout.value[0].y + cutout.value[0].height}px,
        ${cutout.value[0].x}px ${cutout.value[0].y + cutout.value[0].height}px,
        ${cutout.value[0].x}px 100%,
        100% 100%, 100% 0%
      )`
    : undefined

  return (
    <>
      <div
        className='fixed inset-0 z-50'
        style={{ clipPath }}
      />
      <svg
        ref={svg_ref}
        className='fixed inset-0 z-50 pointer-events-none'
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id='tutorial-spotlight-mask'>
            <rect x='0' y='0' width='100%' height='100%' fill='white' />
            {cutout.value.map((bounds) => (
              <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                rx={BORDER_RADIUS}
                ry={BORDER_RADIUS}
                fill='black'
              />
            ))}
          </mask>
        </defs>

        <rect
          x='0'
          y='0'
          width='100%'
          height='100%'
          fill='rgba(0, 0, 0, 0.6)'
          mask='url(#tutorial-spotlight-mask)'
        />

        {cutout.value.map((bounds) => (
          <rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
            rx={BORDER_RADIUS}
            ry={BORDER_RADIUS}
            fill='none'
            stroke={clickable ? '#f59e0b' : '#6366F1'}
            strokeWidth={clickable ? 4 : 3}
            className={clickable ? 'animate-pulse' : ''}
          />
        ))}
      </svg>
    </>
  )
}
