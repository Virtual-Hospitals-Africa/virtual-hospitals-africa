import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'
import * as pdfjs_lib from 'pdfjs-dist'

const WORKER_CDN = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

function parseHash(hash: string): { explicit_page?: number; named_destination?: string } {
  assert(hash.startsWith('#'))
  const remaining = hash.slice(1)
  if (!remaining) return {}

  const page_match = remaining.match(/&?page=(\d+)/)
  if (page_match) {
    return { explicit_page: parseInt(page_match[1], 10) }
  }

  return { named_destination: remaining }
}

export default function PdfViewer({ file_url }: { file_url: string }) {
  const canvas_ref = useRef<HTMLCanvasElement>(null)
  const container_ref = useRef<HTMLDivElement>(null)
  // deno-lint-ignore no-explicit-any
  const pdf_ref = useRef<any>(null)
  const render_task_ref = useRef<{ cancel: () => void } | null>(null)
  const dest_pdf_pos_ref = useRef<{ left: number; bottom: number; right: number; top: number } | null>(null)
  const current_page = useSignal(1)
  const total_pages = useSignal(0)
  const scale = useSignal(1.5)
  const loading = useSignal(true)
  const error = useSignal<string | null>(null)
  const page_input = useSignal('')

  // Load pdf.js and the document
  useEffect(() => {
    let cancelled = false

    const hash = globalThis.location?.hash || '#'
    const { explicit_page, named_destination } = parseHash(hash)

    const initial_page = explicit_page ?? 1
    current_page.value = initial_page
    page_input.value = String(initial_page)

    async function load() {
      try {
        pdfjs_lib.GlobalWorkerOptions.workerSrc = WORKER_CDN

        const pdf = await pdfjs_lib.getDocument(file_url).promise
        if (cancelled) return

        pdf_ref.current = pdf
        total_pages.value = pdf.numPages

        // Resolve named destination to a page number + scroll position
        if (named_destination) {
          try {
            const dest = await pdf.getDestination(named_destination)
            if (dest && !cancelled) {
              // dest[0] is a page reference object
              const page_index = await pdf.getPageIndex(dest[0])
              if (!cancelled) {
                const page_num = page_index + 1 // getPageIndex is 0-based
                current_page.value = page_num
                page_input.value = String(page_num)

                // Store PDF-space rect so render effect can scroll and highlight it
                const dest_type = dest[1]?.name
                if (dest_type === 'FitR' && dest[2] != null) {
                  dest_pdf_pos_ref.current = { left: dest[2], bottom: dest[3], right: dest[4], top: dest[5] }
                }
              }
            }
          } catch {
            // Unknown named destination — stay on page 1
          }
        }

        loading.value = false
      } catch (err) {
        if (!cancelled) error.value = String(err)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [file_url])

  // Render page whenever current_page, scale, or pdf changes
  useEffect(() => {
    const pdf = pdf_ref.current
    const canvas = canvas_ref.current!
    if (!pdf || !canvas || loading.value) return

    let cancelled = false

    async function render() {
      // Cancel any in-progress render
      render_task_ref.current?.cancel()

      const page = await pdf.getPage(current_page.value)
      if (cancelled) return

      const viewport = page.getViewport({ scale: scale.value })
      canvas.width = viewport.width
      canvas.height = viewport.height

      const ctx = canvas.getContext('2d')!
      const task = page.render({ canvasContext: ctx, viewport })
      render_task_ref.current = task

      try {
        await task.promise
      } catch {
        // cancelled render — ignore
      }

      // Scroll to named destination and highlight it (only on initial load)
      if (!cancelled && dest_pdf_pos_ref.current) {
        const { left, bottom, right, top } = dest_pdf_pos_ref.current
        dest_pdf_pos_ref.current = null
        const [vx1, vy1] = viewport.convertToViewportPoint(left, top)
        const [vx2, vy2] = viewport.convertToViewportPoint(right, bottom)
        const container = container_ref.current
        if (container && canvas_ref.current) {
          container.scrollTop = canvas_ref.current.offsetTop + vy1
        }
        ctx.save()
        ctx.fillStyle = 'rgba(255, 220, 0, 0.4)'
        ctx.fillRect(vx1, vy1, vx2 - vx1, vy2 - vy1)
        ctx.restore()
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [current_page.value, scale.value, loading.value])

  // Keep hash in sync with current page
  useEffect(() => {
    if (total_pages.value === 0) return
    const url = new URL(globalThis.location.href)
    globalThis.history.replaceState(null, '', `${url.pathname}${url.search}#page=${current_page.value}`)
  }, [current_page.value, total_pages.value])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(current_page.value + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(current_page.value - 1)
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [current_page.value, total_pages.value])

  function goToPage(n: number) {
    const clamped = Math.max(1, Math.min(n, total_pages.value))
    current_page.value = clamped
    page_input.value = String(clamped)
  }

  function onPageInputChange(e: Event) {
    page_input.value = (e.target as HTMLInputElement).value
  }

  function onPageInputSubmit(e: Event) {
    e.preventDefault()
    const n = parseInt(page_input.value, 10)
    if (!isNaN(n)) goToPage(n)
  }

  if (error.value) {
    return (
      <div class='flex items-center justify-center h-screen bg-gray-900 text-white'>
        <p>Failed to load PDF: {error}</p>
      </div>
    )
  }

  return (
    <div class='flex flex-col h-screen bg-gray-900'>
      {/* Toolbar */}
      <div class='flex items-center gap-3 px-4 py-2 bg-gray-800 text-white text-sm flex-shrink-0'>
        <button
          type='button'
          class='px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40'
          onClick={() => goToPage(current_page.value - 1)}
          disabled={current_page.value <= 1}
        >
          ‹ Prev
        </button>

        <form onSubmit={onPageInputSubmit} class='flex items-center gap-1'>
          <input
            type='number'
            value={page_input}
            onInput={onPageInputChange}
            class='w-14 text-center bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-white'
            min={1}
            max={total_pages}
          />
          <span class='text-gray-400'>/ {total_pages}</span>
        </form>

        <button
          type='button'
          class='px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40'
          onClick={() => goToPage(current_page.value + 1)}
          disabled={current_page.value >= total_pages.value}
        >
          Next ›
        </button>

        <div class='flex items-center gap-1 ml-4'>
          <button
            type='button'
            class='px-2 py-1 rounded bg-gray-700 hover:bg-gray-600'
            onClick={() => scale.value = Math.max(0.5, scale.value - 0.25)}
          >
            −
          </button>
          <span class='w-12 text-center text-gray-300'>{Math.round(scale.value * 100)}%</span>
          <button
            type='button'
            class='px-2 py-1 rounded bg-gray-700 hover:bg-gray-600'
            onClick={() => scale.value = Math.min(4, scale.value + 0.25)}
          >
            +
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div ref={container_ref} class='flex-1 overflow-auto flex justify-center items-start p-4'>
        {loading.value ? <p class='text-gray-400 mt-16'>Loading PDF…</p> : <canvas ref={canvas_ref} class='shadow-2xl' />}
      </div>
    </div>
  )
}
