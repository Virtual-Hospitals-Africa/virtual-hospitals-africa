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

export type FindingSiteSample = { label: string; source: string }

const DRAFTS_KEY = 's_expression_playground_drafts'
const AUTOSAVE_INTERVAL_MS = 5000
const MAX_DRAFTS = 50

type Draft = { name: string; source: string; saved_at: number }

/*
  Drafts are named for what is being worked on, the top-level atom and its description,
  e.g. `finding_site_findings Nose` or `task Raise legs`, so re-saving the same piece of
  work replaces its draft rather than piling up copies
*/
function draftName(source: string): string {
  const match = source.replace(/;;.*$/gm, '').match(/^\s*\(\s*(\w+)(?:\s+"((?:[^"\\]|\\.)*)")?/)
  if (!match) return 'untitled'
  return match[2] ? `${match[1]} ${match[2]}` : match[1]
}

function readDrafts(): Draft[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveDraft(source: string): Draft[] {
  const name = draftName(source)
  const drafts = [{ name, source, saved_at: Date.now() }, ...readDrafts().filter((draft) => draft.name !== name)]
    .slice(0, MAX_DRAFTS)
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch (err) {
    console.error(err)
  }
  return drafts
}

export default function SExpressionPlayground({ finding_site_samples }: { finding_site_samples: FindingSiteSample[] }) {
  const textarea_ref = useRef<HTMLTextAreaElement>(null)
  // deno-lint-ignore no-explicit-any
  const editor_ref = useRef<any>(null)
  // What the editor held when it was last saved or loaded, so that only edits get autosaved
  const last_seen_ref = useRef(SAMPLE)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [finding_displays, setFindingDisplays] = useState<string[] | null>(null)

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

  useEffect(() => {
    setDrafts(readDrafts())
    function autosave() {
      const source: string = editor_ref.current?.getValue() ?? textarea_ref.current?.value ?? ''
      if (!source.trim() || source === last_seen_ref.current) return
      last_seen_ref.current = source
      setDrafts(saveDraft(source))
    }
    const interval = setInterval(autosave, AUTOSAVE_INTERVAL_MS)
    addEventListener('pagehide', autosave)
    return () => {
      clearInterval(interval)
      removeEventListener('pagehide', autosave)
    }
  }, [])

  function setSource(source: string) {
    last_seen_ref.current = source
    if (editor_ref.current) editor_ref.current.setValue(source)
    else if (textarea_ref.current) textarea_ref.current.value = source
    setError(null)
    setValid(false)
    setFindingDisplays(null)
  }

  async function validate() {
    setError(null)
    setValid(false)
    setFindingDisplays(null)
    setSubmitting(true)
    try {
      const expression = editor_ref.current?.getValue() ?? textarea_ref.current?.value ?? ''
      const res = await fetch('/s_expression_playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      })
      const data = await res.json() as { ok: boolean; error?: string; finding_displays?: string[] | null }
      if (data.ok) {
        setValid(true)
        setFindingDisplays(data.finding_displays ?? null)
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
      {(finding_site_samples.length > 0 || drafts.length > 0) && (
        <div class='mb-3 flex justify-end gap-2 md:absolute md:top-6 md:right-6 md:mb-0'>
          {drafts.length > 0 && (
            <select
              aria-label='Restore an autosaved draft'
              value=''
              onChange={(e) => {
                const index = parseInt(e.currentTarget.value)
                if (!isNaN(index)) setSource(drafts[index].source)
                e.currentTarget.value = ''
              }}
              class='border border-gray-300 rounded px-2 py-1 text-sm bg-white'
            >
              <option value=''>Autosaved drafts…</option>
              {drafts.map((draft, i) => (
                <option key={draft.name} value={i}>
                  {draft.name} · {new Date(draft.saved_at).toLocaleString()}
                </option>
              ))}
            </select>
          )}
          {finding_site_samples.length > 0 && (
            <select
              aria-label='Load a finding site page'
              value=''
              onChange={(e) => {
                const index = parseInt(e.currentTarget.value)
                if (!isNaN(index)) setSource(finding_site_samples[index].source)
                e.currentTarget.value = ''
              }}
              class='border border-gray-300 rounded px-2 py-1 text-sm bg-white'
            >
              <option value=''>Load a finding site page…</option>
              {finding_site_samples.map((sample, i) => <option key={sample.label} value={i}>{sample.label}</option>)}
            </select>
          )}
        </div>
      )}
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
      {finding_displays && (
        <ul class='mt-3 list-disc pl-6'>
          {finding_displays.map((display) => <li key={display}>{display}</li>)}
        </ul>
      )}
      {error && (
        <pre class='mt-3 p-3 bg-red-50 border border-red-200 text-red-700 whitespace-pre-wrap text-sm overflow-auto'>
          {error}
        </pre>
      )}
    </div>
  )
}
