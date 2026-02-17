// =============================================================================
// FILE: /islands/tutorial/TutorialSpotlight.tsx
// Dark overlay with optional transparent "spotlight" cutout around target
// =============================================================================

import { useComputed, useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'

type Props = {
  target?: string // Optional - if not provided, just shows dark overlay
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
  const targetBounds = useSignal<DOMRect | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!target) {
      targetBounds.value = null
      return
    }

    const updateBounds = () => {
      const element = document.querySelector(target)
      if (element) {
        targetBounds.value = element.getBoundingClientRect()
      } else {
        targetBounds.value = null
      }
    }

    updateBounds()

    const handleUpdate = () => requestAnimationFrame(updateBounds)
    self.addEventListener('scroll', handleUpdate, true)
    self.addEventListener('resize', handleUpdate)

    const observer = new ResizeObserver(handleUpdate)
    const element = document.querySelector(target)
    if (element) {
      observer.observe(element)
    }

    return () => {
      self.removeEventListener('scroll', handleUpdate, true)
      self.removeEventListener('resize', handleUpdate)
      observer.disconnect()
    }
  }, [target])

  const cutout = useComputed(() => {
    const bounds = targetBounds.value
    if (!bounds) return null

    return {
      x: bounds.x - PADDING,
      y: bounds.y - PADDING,
      width: bounds.width + PADDING * 2,
      height: bounds.height + PADDING * 2,
    }
  })

  const clipPath = clickable && cutout.value
    ? `polygon(
        0% 0%, 0% 100%,
        ${cutout.value.x}px 100%,
        ${cutout.value.x}px ${cutout.value.y}px,
        ${cutout.value.x + cutout.value.width}px ${cutout.value.y}px,
        ${cutout.value.x + cutout.value.width}px ${cutout.value.y + cutout.value.height}px,
        ${cutout.value.x}px ${cutout.value.y + cutout.value.height}px,
        ${cutout.value.x}px 100%,
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
        ref={svgRef}
        className='fixed inset-0 z-50 pointer-events-none'
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id='tutorial-spotlight-mask'>
            <rect x='0' y='0' width='100%' height='100%' fill='white' />
            {cutout.value && (
              <rect
                x={cutout.value.x}
                y={cutout.value.y}
                width={cutout.value.width}
                height={cutout.value.height}
                rx={BORDER_RADIUS}
                ry={BORDER_RADIUS}
                fill='black'
              />
            )}
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

        {cutout.value && (
          <rect
            x={cutout.value.x}
            y={cutout.value.y}
            width={cutout.value.width}
            height={cutout.value.height}
            rx={BORDER_RADIUS}
            ry={BORDER_RADIUS}
            fill='none'
            stroke={clickable ? '#f59e0b' : '#6366F1'}
            strokeWidth={clickable ? 4 : 3}
            className={clickable ? 'animate-pulse' : ''}
          />
        )}
      </svg>
    </>
  )
}
