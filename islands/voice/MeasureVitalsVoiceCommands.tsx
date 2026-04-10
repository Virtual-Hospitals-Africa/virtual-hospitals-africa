import { useEffect, useRef } from 'preact/hooks'
import VoiceMicButton, { VOICE_TRANSCRIPT_EVENT } from './VoiceMicButton.tsx'

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
}

function parseNumber(s: string): number | null {
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function fireInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

// =======================
// Measurements
// =======================

function setMeasurement(spokenVital: string, value: number) {
  const cleaned = normalize(spokenVital)
    .replace(/\s+/g, '_')

  // direct match
  let el = document.querySelector<HTMLInputElement>(
    `input[name="measurements.${CSS.escape(cleaned)}.value"]`,
  )

  // aliases
  if (!el) {
    const alias: Record<string, string> = {
      temp: 'temperature',
      temperature: 'temperature',
      pulse: 'heart_rate',
      'heart rate': 'heart_rate',
      breathing: 'respiratory_rate',
      'respiratory rate': 'respiratory_rate',
      glucose: 'blood_glucose',
      'blood glucose': 'blood_glucose',
    }

    const mapped = alias[cleaned]
    if (mapped) {
      el = document.querySelector<HTMLInputElement>(
        `input[name="measurements.${CSS.escape(mapped)}.value"]`,
      )
    }
  }

  if (!el) return false

  fireInput(el, String(value))
  return true
}

function setBloodPressure(systolic: number, diastolic: number) {
  const sys = document.querySelector<HTMLInputElement>(
    `input[name="measurements.blood_pressure_systolic.value"]`,
  )
  const dia = document.querySelector<HTMLInputElement>(
    `input[name="measurements.blood_pressure_diastolic.value"]`,
  )

  if (sys) fireInput(sys, String(systolic))
  if (dia) fireInput(dia, String(diastolic))

  return Boolean(sys || dia)
}

// =======================
// Assessments
// =======================

function setAssessmentValue(valueText: string) {
  const spoken = normalize(valueText)

  const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'))

  for (const lab of labels) {
    const txt = normalize(lab.textContent || '')
    if (!txt) continue

    if (txt === spoken || txt.includes(spoken)) {
      lab.click()
      return true
    }
  }

  const selects = Array.from(
    document.querySelectorAll<HTMLSelectElement>('select[name^="assessments."]'),
  )

  for (const sel of selects) {
    const opts = Array.from(sel.options)
    const match = opts.find((o) => normalize(o.textContent || '') === spoken) ??
      opts.find((o) => normalize(o.textContent || '').includes(spoken))

    if (match) {
      sel.value = match.value
      sel.dispatchEvent(new Event('input', { bubbles: true }))
      sel.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }
  }

  return false
}

// =======================
// Main Island
// =======================

export default function MeasureVitalsVoiceCommands() {
  const last = useRef<string>('')

  useEffect(() => {
    function onTranscript(e: Event) {
      const ce = e as CustomEvent<{ transcript?: string }>
      const raw = ce.detail?.transcript
      if (!raw) return

      const t = normalize(raw)
      if (!t) return

      if (t === last.current) return
      last.current = t

      // Blood pressure
      const bp = t.match(
        /^blood pressure\s+(\d{2,3})\s*(?:over\s*)?(\d{2,3})$/,
      )
      if (bp) {
        const sys = parseNumber(bp[1])
        const dia = parseNumber(bp[2])
        if (sys != null && dia != null) {
          setBloodPressure(sys, dia)
        }
        return
      }

      // Generic vital measurement
      const m = t.match(
        /^([a-z ]+?)\s+(-?\d+(?:\.\d+)?)$/,
      )
      if (m) {
        const vital = m[1]
        const value = parseNumber(m[2])
        if (value != null) {
          setMeasurement(vital, value)
        }
        return
      }

      // Assessment values (alert / confused / trauma / etc.)
      console.log(t)
      setAssessmentValue(t)
    }

    globalThis.addEventListener(
      VOICE_TRANSCRIPT_EVENT,
      onTranscript as EventListener,
    )
    return () =>
      globalThis.removeEventListener(
        VOICE_TRANSCRIPT_EVENT,
        onTranscript as EventListener,
      )
  }, [])

  return (
    <div class='flex items-center gap-2'>
      <VoiceMicButton />
    </div>
  )
}
