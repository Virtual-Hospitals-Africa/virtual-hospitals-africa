import { Signal } from '@preact/signals'

export type MediaRecorderState =
  | { type: 'none' }
  | { type: 'initializing' }
  | { type: 'ready'; media_recorder: MediaRecorder; stream: MediaStream }
  | {
    type: 'error'
    media_recorder: MediaRecorder
    stream: MediaStream
    // deno-lint-ignore no-explicit-any
    error: any
  }

export async function startStreamAndMediaRecorder(
  signal: Signal<MediaRecorderState>,
) {
  signal.value = { type: 'initializing' }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 16000,
      sampleSize: 16,
      echoCancellation: true,
      noiseSuppression: true,
    },
  })

  const media_recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 16000,
  })

  media_recorder.onerror = function (error) {
    signal.value = { type: 'error', media_recorder, stream, error }
  }

  signal.value = { type: 'ready', media_recorder, stream }
}
