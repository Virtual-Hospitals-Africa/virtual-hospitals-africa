import { useEffect, useRef, useState } from 'preact/hooks'

const CM_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16'

// deno-lint-ignore no-explicit-any
declare const CodeMirror: any

const SAMPLE = `(clinical_finding (snomed_concept "Cough" "finding"))
(clinical_finding (snomed_concept "Fever" "finding"))
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

export default function AdHocFindings() {
  const textarea_ref = useRef<HTMLTextAreaElement>(null)
  // deno-lint-ignore no-explicit-any
  const editor_ref = useRef<any>(null)
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

  function onSubmit(_e: Event) {
    if (editor_ref.current) {
      editor_ref.current.save()
    }
    setSubmitting(true)
  }

  return (
    <form method='POST' onSubmit={onSubmit}>
      <div class='border border-gray-300 rounded'>
        <textarea
          ref={textarea_ref}
          name='findings_text'
          defaultValue={SAMPLE}
          rows={20}
          class='w-full font-mono text-sm p-2'
        />
      </div>
      <div class='mt-3'>
        <button
          type='submit'
          disabled={submitting}
          class='px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50'
        >
          {submitting ? 'Submitting...' : 'Submit Findings'}
        </button>
      </div>
    </form>
  )
}
