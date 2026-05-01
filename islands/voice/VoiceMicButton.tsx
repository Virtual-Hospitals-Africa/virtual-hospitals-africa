import { useEffect, useRef, useState } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import cls from '../../util/cls.ts'
import { MicrophoneIcon } from '../../components/library/icons/heroicons/solid.tsx'
import type { RenderedHealthWorker } from '../../types.ts'
import { VOICE_COMMANDS_TUTORIAL_STEPS, VoiceCommandsTutorialModal } from './VoiceCommandsTutorialModal.tsx'

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

export interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean

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

export default function VoiceMicButton({ healthWorker }: { healthWorker: RenderedHealthWorker }) {
  const status = useSignal<VoiceStatus>('idle')
  const want_listening = useSignal(false)
  const [show_tutorial, set_show_tutorial] = useState(false)
  const [tutorial_step, set_tutorial_step] = useState(0)

  const recognition_ref = useRef<SpeechRecognition | null>(null)

  const is_listening = status.value === 'listening'
  const is_unavailable = status.value === 'unsupported' || status.value === 'permission_denied'

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
    if (is_unavailable) return

    const has_seen_help_key = `voice-commands-help-seen-${healthWorker.id}`
    const has_seen_help = localStorage.getItem(has_seen_help_key) === 'true'

    if (!has_seen_help) {
      localStorage.setItem(has_seen_help_key, 'true')
      set_tutorial_step(0)
      set_show_tutorial(true)
      return
    }

    if (is_listening) stop()
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
    <>
      {show_tutorial && (
        <VoiceCommandsTutorialModal
          step={tutorial_step}
          step_count={VOICE_COMMANDS_TUTORIAL_STEPS.length}
          text={VOICE_COMMANDS_TUTORIAL_STEPS[tutorial_step]}
          on_prev={() => set_tutorial_step((current) => Math.max(0, current - 1))}
          on_next={() => {
            const next_step = Math.min(VOICE_COMMANDS_TUTORIAL_STEPS.length - 1, tutorial_step + 1)
            if (next_step === tutorial_step && tutorial_step === VOICE_COMMANDS_TUTORIAL_STEPS.length - 1) {
              set_show_tutorial(false)
              start()
            } else {
              set_tutorial_step(next_step)
            }
          }}
          on_close={() => set_show_tutorial(false)}
        />
      )}

      <button
        type='button'
        onClick={handleClick}
        aria-pressed={is_listening}
        aria-label='Toggle voice commands'
        className={cls(
          'fixed z-50 bottom-5 right-5',
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
          'transition-all duration-200 ease-in-out',
          is_unavailable ? 'bg-gray-300 cursor-not-allowed' : is_listening ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700',
          is_listening && 'scale-105',
        )}
      >
        {is_listening && <span className='absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-ping' />}

        <MicrophoneIcon className={cls('h-6 w-6 text-white', is_listening && 'animate-pulse')} />
      </button>
    </>
  )
}
