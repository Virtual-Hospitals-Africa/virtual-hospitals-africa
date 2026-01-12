import { Signal } from '@preact/signals'
import { assert } from 'std/assert/assert.ts'

export type SpeechWebsocketState =
  | { type: 'none' }
  | { type: 'establishing_connection'; websocket: WebSocket }
  | { type: 'ready_for_audio'; websocket: WebSocket; media_speech_id: string }
  | {
    type: 'stream_ended_awaiting_transcription'
    websocket: WebSocket
    media_speech_id: string
  }
  | {
    type: 'transcription_finished'
    websocket: WebSocket
    media_speech_id: string
    transcription: string
  }
  // deno-lint-ignore no-explicit-any
  | { type: 'error'; websocket: WebSocket; error: any }

export function startSpeechWebsocket(
  { language_code }: { language_code: string },
  signal: Signal<SpeechWebsocketState>,
) {
  const ws_uri = `wss://${self.location.host}/app/speech-websocket?language_code=${language_code}`

  const websocket = new WebSocket(ws_uri)

  websocket.onopen = function () {
    console.log('websocket open')
  }

  websocket.onclose = function () {
    console.log('websocket close')
  }

  websocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data)
    const { type, media_speech_id, transcription } = parsed
    switch (type) {
      case 'connection_established':
        assert(typeof media_speech_id === 'string')
        signal.value = { type: 'ready_for_audio', websocket, media_speech_id }
        break
      case 'transcription_finished':
        assert(typeof transcription === 'string')
        signal.value = {
          type: 'transcription_finished',
          websocket,
          media_speech_id,
          transcription,
        }
        break
      default:
        throw new Error(`Unsupported type: ${type}`)
    }
  }

  websocket.onerror = function (error) {
    signal.value = { type: 'error', websocket, error }
  }

  signal.value = { type: 'establishing_connection', websocket }
}
