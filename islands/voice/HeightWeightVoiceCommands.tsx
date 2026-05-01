import { parseNumber } from '../../shared/voice_commands.ts'
import type { RenderedHealthWorker } from '../../types.ts'
import VoiceMicButton, { VOICE_TRANSCRIPT_EVENT } from './VoiceMicButton.tsx'
import { useEffect, useRef } from 'preact/hooks'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w.\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function fireInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(el, value)

  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function setMeasurement(name: string, value: number): boolean {
  const selector = `input[name="measurements.${name}.value"]`

  const input = document.querySelector<HTMLInputElement>(selector)

  if (!input) {
    console.log('[HEIGHT_WEIGHT] input not found:', selector)
    return false
  }

  fireInput(input, String(value))

  console.log('[HEIGHT_WEIGHT] set', name, 'to', value)

  return true
}

function handleTranscript(transcript: string) {
  console.log('[HEIGHT_WEIGHT] event received')

  const normalized = normalize(transcript)

  console.log('[HEIGHT_WEIGHT] transcript:', transcript)
  console.log('[HEIGHT_WEIGHT] normalized:', normalized)

  if (
    normalized.startsWith('height') ||
    normalized.startsWith('body height')
  ) {
    const value = extractValue(normalized)

    if (value !== null) {
      setMeasurement('height', value)
      return
    }
  }

  if (
    normalized.startsWith('weight') ||
    normalized.startsWith('body weight')
  ) {
    const value = extractValue(normalized)

    if (value !== null) {
      setMeasurement('weight', value)
      return
    }
  }
}

function extractValue(spoken: string): number | null {
  console.log('[HEIGHT_WEIGHT] Parsing number from spoken input:', spoken)

  const parts = spoken.split(' ')

  for (let i = parts.length; i > 0; i--) {
    const candidate = parts.slice(i - 1).join(' ')
    const n = parseNumber(candidate)

    if (n !== null) {
      return n
    }
  }

  return null
}

export default function HeightWeightVoiceCommands({
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

      handleTranscript(raw)
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
