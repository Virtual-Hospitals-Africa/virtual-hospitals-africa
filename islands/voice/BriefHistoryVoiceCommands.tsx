import { useEffect, useRef } from 'preact/hooks'
import type { RenderedHealthWorker } from '../../types.ts'
import VoiceMicButton, { VOICE_TRANSCRIPT_EVENT } from './VoiceMicButton.tsx'

type Existence = 'Yes' | 'No' | 'Unknown'

const CONDITION_KEYS = [
  'diabetes',
  'pregnancy',
  'tuberculosis',
  'hiv',
  'asthma',
  'copd',
  'covid19',
  'heart_disease',
  'mental_disorder',
  'epilepsy',
  'arthritis',
  'cancer',
] as const

type ConditionKey = typeof CONDITION_KEYS[number]

const ALIASES: Record<string, ConditionKey> = {
  diabetes: 'diabetes',
  pregnant: 'pregnancy',
  pregnancy: 'pregnancy',
  tb: 'tuberculosis',
  tuberculosis: 'tuberculosis',
  hiv: 'hiv',
  asthma: 'asthma',
  copd: 'copd',
  covid: 'covid19',
  'covid 19': 'covid19',
  'heart disease': 'heart_disease',
  heart: 'heart_disease',
  epilepsy: 'epilepsy',
  arthritis: 'arthritis',
  cancer: 'cancer',
  depression: 'mental_disorder',
  anxiety: 'mental_disorder',
  'mental disorder': 'mental_disorder',
}

function normalize(s: string) {
  return s.toLowerCase().trim()
}

function parseExistence(t: string): Existence | null {
  if (/\b(yes|yep|present|positive|has|have)\b/.test(t)) return 'Yes'
  if (/\b(no|nope|negative|denies|none|without)\b/.test(t)) return 'No'
  if (/\b(unknown|not sure|unsure|don\'t know)\b/.test(t)) return 'Unknown'
  return null
}

function setExistence(key: ConditionKey, value: Existence) {
  const name = `common_conditions.${key}.existence`
  const selector = `input[type="radio"][name="${name}"][value="${value}"]`
  const el = document.querySelector<HTMLInputElement>(selector)
  el?.click()
}

function setAll(value: Existence) {
  for (const key of CONDITION_KEYS) setExistence(key, value)
}

export default function BriefHistoryVoiceCommands({ healthWorker }: { healthWorker: RenderedHealthWorker }) {
  const last = useRef<string>('')

  useEffect(() => {
    function onTranscript(e: Event) {
      console.log('Transcript event detail:', (e as CustomEvent).detail)
      const ce = e as CustomEvent<{ transcript?: string }>
      const raw = ce.detail?.transcript
      if (!raw) return

      const t = normalize(raw)

      if (t === last.current) return
      last.current = t

      // --- global commands ---
      if (/\b(clear|reset)\b.*\b(history|brief history)\b/.test(t)) {
        setAll('Unknown')
        return
      }

      if (/\b(no)\b.*\b(all|any)\b.*\b(conditions|medical history|history)\b/.test(t)) {
        setAll('No')
        return
      }

      // --- targeted condition commands ---
      // pattern examples:
      // "diabetes yes"
      // "no asthma"
      // "tb unknown"
      // "patient has hiv" (=> yes)
      const existence = parseExistence(t)
      if (!existence) return

      // find which condition was mentioned
      for (const phrase in ALIASES) {
        if (t.includes(phrase)) {
          setExistence(ALIASES[phrase], existence)
          return
        }
      }

      for (const key of CONDITION_KEYS) {
        if (t.includes(key)) {
          setExistence(key, existence)
          return
        }
      }
    }

    globalThis.addEventListener(VOICE_TRANSCRIPT_EVENT, onTranscript)
    return () => globalThis.removeEventListener(VOICE_TRANSCRIPT_EVENT, onTranscript)
  }, [])

  return (
    <div class='flex items-center gap-2'>
      <VoiceMicButton healthWorker={healthWorker} />
    </div>
  )
}
