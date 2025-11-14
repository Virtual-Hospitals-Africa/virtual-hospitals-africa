import { computed, effect, useSignal } from '@preact/signals'
import { Button } from '../../components/library/Button.tsx'
import { MicrophoneIcon } from '../../components/library/icons/heroicons/outline.tsx'

import { assert } from 'std/assert/assert.ts'
import { RecordDialog, RecordingState } from './RecordDialog.tsx'
import {
  SpeechWebsocketState,
  startSpeechWebsocket,
} from './startSpeechWebsocket.ts'
import {
  MediaRecorderState,
  startStreamAndMediaRecorder,
} from './startStreamAndMediaRecorder.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'
import { TextArea } from '../form/inputs/textarea.tsx'
import { LIVING_LANGUAGES } from '../../shared/languages.ts'

export function ChiefComplaintSection({
  preferred_language_code_iso_639_2_b,
  // patient_chief_complaint,
}: {
  preferred_language_code_iso_639_2_b: string | null
  patient_chief_complaint: unknown
}) {
  const chief_complaint_note = useSignal('')
  const language_code = useSignal(preferred_language_code_iso_639_2_b || 'eng')
  const speech_websocket_signal = useSignal<SpeechWebsocketState>({
    type: 'none',
  })
  const media_recorder_signal = useSignal<MediaRecorderState>({ type: 'none' })

  const recording_signal = useSignal<RecordingState>({
    recording: false,
  })

  const transcribing_audio = computed(() =>
    speech_websocket_signal.value.type === 'stream_ended_awaiting_transcription'
  )

  effect(() => {
    if (speech_websocket_signal.value.type !== 'transcription_finished') return
    const { transcription } = speech_websocket_signal.value
    chief_complaint_note.value = transcription
    speech_websocket_signal.value = { type: 'none' }
  })

  effect(() => {
    if (speech_websocket_signal.value.type !== 'ready_for_audio') return
    if (media_recorder_signal.value.type !== 'ready') return

    const { media_recorder, stream } = media_recorder_signal.value
    if (media_recorder.state === 'recording') return

    const { websocket } = speech_websocket_signal.value

    media_recorder.ondataavailable = (event) => {
      if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
        // Send binary audio data to server
        websocket.send(event.data)
      }
    }

    media_recorder.onstop = () => {
      console.log('Recording stopped', 'idle')
      stream.getTracks().forEach((track) => track.stop())
    }

    media_recorder.start(100) // Send data every 100ms

    recording_signal.value = {
      recording: true,
      stop() {
        assert(speech_websocket_signal.value.type === 'ready_for_audio')
        media_recorder.stop()
        media_recorder_signal.value = { type: 'none' }
        websocket.send(JSON.stringify({ type: 'audio_ended' }))
        speech_websocket_signal.value = {
          type: 'stream_ended_awaiting_transcription',
          websocket,
          media_speech_id: speech_websocket_signal.value.media_speech_id,
        }
        recording_signal.value = { recording: false }
      },
      cancel() {
        throw new Error('TODO: Implement')
      },
    }
  })

  return (
    <div>
      Chief Complaint

      <SelectWithOptions
        name='language_code'
        value={language_code.value}
        options={LIVING_LANGUAGES.map((lang) => ({
          value: lang.iso_639_2_b,
          label: lang.language_names[0],
        }))}
        onChange={(e) => {
          language_code.value = e.currentTarget.value
        }}
      />

      {transcribing_audio.value ? 'Transcribing audio...' : (
        <Button
          variant='secondary'
          type='button'
          title='Record Chief Complaint'
          // className='w-8 h-8'
          onClick={() => {
            startSpeechWebsocket({
              language_code: language_code.value,
            }, speech_websocket_signal)
            startStreamAndMediaRecorder(media_recorder_signal)
          }}
        >
          <MicrophoneIcon className='w-4 h-4' />
        </Button>
      )}

      {'media_speech_id' in speech_websocket_signal.value && (
        <HiddenInput
          name='media_speech_id'
          value={speech_websocket_signal.value.media_speech_id}
        />
      )}

      <TextArea
        name='note'
        label='Chief Complaint'
        disabled={transcribing_audio.value}
        value={chief_complaint_note.value}
        // onInput={} // mark and save as dirty
      />

      <RecordDialog
        {...recording_signal.value}
      />

      {speech_websocket_signal.value.type === 'error' && (
        <span>{speech_websocket_signal.value.error.message}</span>
      )}

      {media_recorder_signal.value.type === 'error' && (
        <span>{media_recorder_signal.value.error.message}</span>
      )}
    </div>
  )
}
