import { useEffect, useRef } from 'preact/hooks'
import VoiceMicButton, { VOICE_TRANSCRIPT_EVENT } from './VoiceMicButton.tsx'
import { ASSESSMENT_VALUE_ALIASES, COMMON_BLOOD_PRESSURE_READINGS, parseNumber, VITAL_VOICE_ALIASES } from '../../shared/voice_commands.ts'
import type { RenderedHealthWorker } from '../../types.ts'

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/(?<!\d)\.(?!\d)/g, ' ')
    .replace(/[^\w.\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
}

function fireInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

  setter?.call(el, value)

  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function fireSelect(sel: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set

  setter?.call(sel, value)

  sel.dispatchEvent(new Event('input', { bubbles: true }))
  sel.dispatchEvent(new Event('change', { bubbles: true }))
}

function setMeasurement(spokenVital: string, value: number) {
  const cleaned = normalize(spokenVital).replace(/\s+/g, '_')

  let el = document.querySelector<HTMLInputElement>(
    `input[name="measurements.${CSS.escape(cleaned)}.value"]`,
  )

  if (!el) {
    const mapped = VITAL_VOICE_ALIASES[cleaned]

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

function setAssessmentValue(valueText: string) {
  const spoken = normalize(valueText)
  const candidates = ASSESSMENT_VALUE_ALIASES[spoken] ?? [spoken]

  console.log('--- ASSESSMENT DEBUG START ---')
  console.log('spoken value:', spoken)
  console.log('candidate values:', candidates)

  const selects = Array.from(
    document.querySelectorAll<HTMLSelectElement>(
      'select[name^="assessments."][name$=".s_expression"]',
    ),
  )

  console.log(
    'selects found:',
    selects.map((s) => ({
      name: s.name,
      id: s.id,
      currentValue: s.value,
    })),
  )

  if (!selects.length) {
    console.warn('No assessment selects found')
    console.log('--- ASSESSMENT DEBUG END ---')
    return false
  }

  for (const sel of selects) {
    console.log('checking select:', sel.name)

    const opts = Array.from(sel.options)

    console.log(
      'options:',
      opts.map((o) => ({
        text: o.textContent,
        value: o.value,
        normalizedText: normalize(o.textContent || ''),
        normalizedValue: normalize(o.value || ''),
      })),
    )

    for (const candidate of candidates) {
      const c = normalize(candidate)

      console.log('checking candidate:', c)

      for (const o of opts) {
        const txt = normalize(o.textContent || '')
        const val = normalize(o.value || '')

        console.log('compare:', {
          spoken,
          candidate: c,
          optionText: txt,
          optionValue: val,
        })

        if (txt === c) {
          console.log('EXACT TEXT MATCH')
          console.log('SETTING VALUE:', o.value)

          fireSelect(sel, o.value)

          console.log('--- ASSESSMENT DEBUG SUCCESS ---')
          return true
        }

        if (val === c) {
          console.log('VALUE MATCH')
          console.log('SETTING VALUE:', o.value)

          fireSelect(sel, o.value)

          console.log('--- ASSESSMENT DEBUG SUCCESS ---')
          return true
        }

        if (val.includes(c)) {
          console.log('PARTIAL VALUE MATCH')
          console.log('SETTING VALUE:', o.value)

          fireSelect(sel, o.value)

          console.log('--- ASSESSMENT DEBUG SUCCESS ---')
          return true
        }

        if (txt.includes(c)) {
          console.log('PARTIAL TEXT MATCH')
          console.log('SETTING VALUE:', o.value)

          fireSelect(sel, o.value)

          console.log('--- ASSESSMENT DEBUG SUCCESS ---')
          return true
        }
      }
    }
  }

  console.warn('No assessment match found')
  console.log('--- ASSESSMENT DEBUG END ---')

  return false
}

export default function MeasureVitalsVoiceCommands({
  healthWorker,
}: {
  healthWorker: RenderedHealthWorker
}) {
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

      const bp_match = COMMON_BLOOD_PRESSURE_READINGS.find(([spoken]) => t.includes(spoken) || spoken.includes(t))

      if (bp_match) {
        const [, systolic, diastolic] = bp_match
        setBloodPressure(systolic, diastolic)
        return
      }

      const bp = t.match(
        /^blood pressure\s*:?\s*(\d{2,3})\s*(?:over\s*)?(\d{2,3})$/,
      )

      if (bp) {
        const sys = parseNumber(bp[1])
        const dia = parseNumber(bp[2])

        if (sys != null && dia != null) {
          setBloodPressure(sys, dia)
        }

        return
      }

      const m = t.match(/^([a-z ]+?)\s*:?\s*(-?\d+(?:\.\d+)?)$/)

      if (m) {
        const vital = m[1]
        const value = parseNumber(m[2])

        if (value != null) {
          setMeasurement(vital, value)
        }

        return
      }

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
      <VoiceMicButton healthWorker={healthWorker} />
    </div>
  )
}
