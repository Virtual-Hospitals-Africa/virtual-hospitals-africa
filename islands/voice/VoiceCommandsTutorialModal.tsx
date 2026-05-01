import { VOICE_COMMANDS_HELP_MESSAGE } from '../../shared/voice_commands.ts'

type VoiceCommandsTutorialModalProps = {
  step: number
  step_count: number
  text: string
  on_prev: () => void
  on_next: () => void
  on_close: () => void
}

export const VOICE_COMMANDS_TUTORIAL_STEPS = VOICE_COMMANDS_HELP_MESSAGE
  .split('\n\n')
  .map((block) => block.trim())
  .filter(Boolean)

export function VoiceCommandsTutorialModal({
  step,
  step_count,
  text,
  on_prev,
  on_next,
  on_close,
}: VoiceCommandsTutorialModalProps) {
  return (
    <div class='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div class='w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10'>
        <div class='flex items-center justify-between gap-4 pb-3 border-b border-gray-200'>
          <div>
            <p class='text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600'>Voice commands tutorial</p>
            <p class='text-xs text-slate-500'>Step {step + 1} of {step_count}</p>
          </div>
          <button
            type='button'
            onClick={on_close}
            class='text-slate-500 hover:text-slate-700'
            aria-label='Close tutorial'
          >
            ×
          </button>
        </div>

        <div class='mt-4 space-y-4 text-sm leading-6 text-slate-800'>
          <pre class='whitespace-pre-wrap wrap-break-word'>{text}</pre>
        </div>

        <div class='mt-6 flex items-center justify-between gap-3'>
          <button
            type='button'
            onClick={on_prev}
            disabled={step === 0}
            class='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Back
          </button>

          <div class='flex items-center gap-2'>
            <button
              type='button'
              onClick={on_next}
              class='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
            >
              {step === step_count - 1 ? 'Start voice commands' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
