import { useEffect, useRef, useState } from 'preact/hooks'

const CM_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16'

// deno-lint-ignore no-explicit-any
declare const CodeMirror: any

const SAMPLE = `(task
  "Raise legs"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Elevation of lower limb" "procedure")
  )
)
`

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load ${href}`))
    document.head.appendChild(link)
  })
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export default function SExpressionPlayground() {
  const textarea_ref = useRef<HTMLTextAreaElement>(null)
  // deno-lint-ignore no-explicit-any
  const editor_ref = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadStylesheet(`${CM_BASE}/codemirror.min.css`)
        await loadScript(`${CM_BASE}/codemirror.min.js`)
        await loadScript(`${CM_BASE}/mode/scheme/scheme.min.js`)
        await loadScript(`${CM_BASE}/addon/edit/matchbrackets.min.js`)
        if (cancelled || !textarea_ref.current) return
        editor_ref.current = CodeMirror.fromTextArea(textarea_ref.current, {
          mode: 'scheme',
          lineNumbers: true,
          matchBrackets: true,
          indentUnit: 2,
          tabSize: 2,
          viewportMargin: Infinity,
        })
        editor_ref.current.setSize('100%', '420px')
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
      if (editor_ref.current) {
        editor_ref.current.toTextArea()
        editor_ref.current = null
      }
    }
  }, [])

  async function validate() {
    setError(null)
    setValid(false)
    setSubmitting(true)
    try {
      const expression = editor_ref.current?.getValue() ?? textarea_ref.current?.value ?? ''
      const res = await fetch('/s_expression_playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      if (data.ok) {
        setValid(true)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div class='border border-gray-300 rounded'>
        <textarea
          ref={textarea_ref}
          defaultValue={SAMPLE}
          rows={20}
          class='w-full font-mono text-sm p-2'
        />
      </div>
      <div class='mt-3 flex gap-3 items-center'>
        <button
          type='button'
          onClick={validate}
          disabled={submitting}
          class='px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50'
        >
          {submitting ? 'Validating…' : 'Validate'}
        </button>
        {valid && <span class='text-green-700 font-medium'>Valid</span>}
      </div>
      {error && (
        <pre class='mt-3 p-3 bg-red-50 border border-red-200 text-red-700 whitespace-pre-wrap text-sm overflow-auto'>
          {error}
        </pre>
      )}
    </div>
  )
}
