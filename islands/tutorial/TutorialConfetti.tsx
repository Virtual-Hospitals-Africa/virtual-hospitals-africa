// =============================================================================
// FILE: /islands/tutorial/TutorialConfetti.tsx
// Celebratory confetti animation in purple shades
// =============================================================================

import { useEffect, useRef } from 'preact/hooks'

// Purple shades from design system
const COLORS = [
  '#6366f1', // indigo-500 (primary)
  '#818cf8', // indigo-400
  '#a5b4fc', // indigo-300
  '#c7d2fe', // indigo-200
  '#7c3aed', // violet-600
  '#8b5cf6', // violet-500
  '#a78bfa', // violet-400
  '#6b21a8', // purple-800 (from design system)
]

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

function createParticle(canvasWidth: number, fromTop: boolean): Particle {
  if (fromTop) {
    // Continuous rain from top
    return {
      x: Math.random() * canvasWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
    }
  } else {
    // Initial explosion from center
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 8 + 4
    return {
      x: canvasWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
    }
  }
}

/**
 * Canvas-based confetti animation
 * - Starts with explosion from center
 * - Continues with rain from top
 */
export function TutorialConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create initial explosion particles
    const particles: Particle[] = []
    const explosionCount = 250

    for (let i = 0; i < explosionCount; i++) {
      particles.push(createParticle(canvas.width, false))
    }

    let animationId: number
    let frameCount = 0

    const animate = () => {
      frameCount++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new particles from top continuously (after initial explosion settles)
      if (frameCount > 60 && frameCount % 3 === 0 && particles.length < 200) {
        particles.push(createParticle(canvas.width, true))
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Update position
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08 // gravity
        p.rotation += p.rotationSpeed

        // Add wobble
        p.vx += (Math.random() - 0.5) * 0.1

        // Air resistance
        p.vx *= 0.99
        p.vy *= 0.99

        // Remove if off screen
        if (p.y > canvas.height + 50) {
          particles.splice(i, 1)
          continue
        }

        // Draw particle
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        // Draw rectangle confetti
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)

        ctx.restore()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className='fixed inset-0 z-[70] pointer-events-none'
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
