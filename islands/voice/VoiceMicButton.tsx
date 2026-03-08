import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import cls from '../../util/cls.ts'
import { MicrophoneIcon } from '../../components/library/icons/heroicons/solid.tsx'

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

export interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean

  // Experimental on-device flag (may not exist in all browsers)
  processLocally?: boolean

  start(): void
  stop(): void
  abort(): void

  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
}

type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'unsupported'
  | 'permission_denied'
  | 'error'

type SpeechRecognitionCtor =
  | (new () => SpeechRecognition)
  | undefined

function getSpeechRecognitionCtor(): SpeechRecognitionCtor {
  // deno-lint-ignore no-explicit-any
  return (globalThis as any).SpeechRecognition ?? (globalThis as any).webkitSpeechRecognition
}

export const VOICE_TRANSCRIPT_EVENT = 'vha-voice:transcript'

// Minimal typing for the experimental static methods.
// In supporting browsers, these exist on globalThis.SpeechRecognition. :contentReference[oaicite:2]{index=2}
type SpeechRecognitionStatic = {
  available?: (opts: { langs: string[]; processLocally?: boolean }) => Promise<
    'available' | 'downloadable' | 'downloading' | 'unavailable'
  >
  install?: (opts: { langs: string[]; processLocally?: boolean }) => Promise<boolean>
}

function getSpeechRecognitionStatic(): SpeechRecognitionStatic | null {
  // deno-lint-ignore no-explicit-any
  const SR = (globalThis as any).SpeechRecognition as SpeechRecognitionStatic | undefined
  return SR ?? null
}

export default function VoiceMicButton() {
  const status = useSignal<VoiceStatus>('idle')
  const want_listening = useSignal(false)

  const recognition_ref = useRef<SpeechRecognition | null>(null)

  const isListening = status.value === 'listening'
  const isUnavailable = status.value === 'unsupported' || status.value === 'permission_denied'

  function ensureRecognition(): SpeechRecognition | null {
    if (recognition_ref.current) return recognition_ref.current

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      status.value = 'unsupported'
      return null
    }

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.processLocally = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result.isFinal) continue

        const transcript = result[0]?.transcript?.trim()
        if (!transcript) continue

        globalThis.dispatchEvent(
          new CustomEvent(VOICE_TRANSCRIPT_EVENT, {
            detail: { transcript },
          }),
        )
      }
    }

    recognition.onerror = (e: Event) => {
      // deno-lint-ignore no-explicit-any
      const err = (e as any)?.error as string | undefined

      if (err === 'not-allowed' || err === 'service-not-allowed') {
        status.value = 'permission_denied'
        want_listening.value = false
        return
      }

      status.value = 'error'
      want_listening.value = false
    }

    recognition.onend = () => {
      // Chrome can stop unexpectedly; restart if we still want listening
      if (want_listening.value) {
        recognition.start()
        status.value = 'listening'
      } else {
        status.value = 'idle'
      }
    }

    recognition_ref.current = recognition
    return recognition
  }

  async function start() {
    const recognition = ensureRecognition()
    if (!recognition) return

    want_listening.value = true

    const SR = getSpeechRecognitionStatic()
    const lang = recognition.lang || 'en-US'

    try {
      if (SR?.available && SR?.install && ('processLocally' in recognition) && recognition.processLocally) {
        const availability = await SR.available({ langs: [lang], processLocally: true })

        if (availability === 'unavailable') {
          recognition.processLocally = false
        }

        if (availability === 'downloadable' || availability === 'downloading') {
          const ok = await SR.install({ langs: [lang], processLocally: true })
          if (!ok) {
            status.value = 'error'
            want_listening.value = false
            return
          }
        }
      }

      recognition.start()
      status.value = 'listening'
    } catch (e) {
      // deno-lint-ignore no-explicit-any
      const err = (e as any)?.message as string | undefined
      if (err?.includes('not-allowed')) status.value = 'permission_denied'
      else status.value = 'error'
      want_listening.value = false
    }
  }

  function stop() {
    want_listening.value = false
    const recognition = recognition_ref.current
    recognition?.stop()
    status.value = 'idle'
  }

  function handleClick() {
    if (isUnavailable) return
    if (isListening) stop()
    else start()
  }

  useEffect(() => {
    return () => {
      want_listening.value = false
      recognition_ref.current?.stop()
      recognition_ref.current = null
    }
  }, [])

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-pressed={isListening}
      aria-label='Toggle voice commands'
      className={cls(
        'fixed z-50 bottom-5 right-5',
        'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
        'transition-all duration-200 ease-in-out',
        isUnavailable
          ? 'bg-gray-300 cursor-not-allowed'
          : isListening
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-indigo-600 hover:bg-indigo-700',
        isListening && 'scale-105',
      )}
    >
      {isListening && (
        <span className='absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-ping' />
      )}

      <MicrophoneIcon className={cls('h-6 w-6 text-white', isListening && 'animate-pulse')} />
    </button>
  )
}