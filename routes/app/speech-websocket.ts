import { LoggedInHealthWorkerContext } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import {
  insertSpeech,
  insertSpeechTranscription,
} from '../../db/models/media.ts'
import upgradeWebsocket from '../../util/websocket.ts'
import {
  supported_language_codes,
  transcriptionProcess,
} from '../../external-clients/whisper/transcription.ts'
import * as ffmpeg from '../../external-clients/ffmpeg.ts'
import { deferred } from 'https://deno.land/std@0.136.0/async/deferred.ts'
import { assertOr400 } from '../../util/assertOr.ts'

function createPipeline(language_code: string) {
  const media_speech_id = generateUUID()
  const start_time = new Date()

  const transcription = transcriptionProcess(language_code)
  const file_path = `temp_files/${media_speech_id}.wav`
  const ffmpeg_process = ffmpeg.convertToWavWriteToFile(file_path)

  const audio_chunks: Uint8Array[] = []
  let total_bytes = 0
  let is_stream_closed = false

  const deferred_media = deferred<{
    binary_data: Uint8Array
    mime_type: 'audio/webm'
  }>()

  const deferred_transcription = deferred<string>()

  async function onAudioChunk(audio_chunk: Uint8Array) {
    audio_chunks.push(audio_chunk)
    total_bytes += audio_chunk.length

    // Stream the chunk directly to ffmpeg
    await ffmpeg_process.writer.write(audio_chunk)

    // Log progress
    const duration = Date.now() - startTime.getTime()
    console.log(
      `🎵 Audio chunk streamed - media_speech_id: ${media_speech_id}, Size: ${audio_chunk.length} bytes, Total: ${total_bytes} bytes, Duration: ${
        Math.round(duration / 1000)
      }s`,
    )
  }

  async function onAudioEnded() {
    if (is_stream_closed) return
    is_stream_closed = true

    const now = Date.now()

    Promise.resolve().then(() => {
      const binary_data = new Uint8Array(total_bytes)
      let offset = 0

      for (const chunk of audio_chunks) {
        binary_data.set(chunk, offset)
        offset += chunk.length
      }
      deferred_media.resolve({ binary_data, mime_type: 'audio/webm' })
    })

    await ffmpeg_process.finish()
    console.log(
      `Ffmpeg finished after an additional ${Date.now() - now} milliseconds`,
    )
    const transcribed_text = await transcription.transcribe(file_path)
    deferred_transcription.resolve(transcribed_text)
  }

  return {
    media_speech_id,
    deferred_media,
    deferred_transcription,
    transcription_model: transcription.model,
    async onMessage({ data }: MessageEvent) {
      if (is_stream_closed) return

      // The browser leaves the connection open, sending an audio_ended
      // event because it expects the websocket to eventually send the
      // transcription
      if (typeof data === 'string') {
        const parsed = JSON.parse(data)
        if (parsed.type === 'audio_ended') {
          return onAudioEnded()
        }
        throw new Error(`📝 Unexpected Text message ${data}`)
      }

      if (data instanceof ArrayBuffer) {
        return onAudioChunk(new Uint8Array(data))
      }
      if (data instanceof Blob) {
        const array_buffer = await data.arrayBuffer()
        return onAudioChunk(new Uint8Array(arrayBuffer))
      }

      throw new Error('Unexpected data type: ' + data)
    },

    async cleanup() {
      if (!is_stream_closed) {
        is_stream_closed = true
        await ffmpeg_process.writer.close()
        ffmpeg_process.sigterm()
      }
    },
  }
}

export default upgradeWebsocket((
  ctx: LoggedInHealthWorkerContext,
  socket: WebSocket,
) => {
  const language_code = ctx.url.searchParams.get('language_code')
  assertOr400(language_code, 'Needs language code')
  assertOr400(
    supported_language_codes.includes(language_code),
    `Transcription not supported for ${language_code}`,
  )

  const pipeline = createPipeline(language_code)

  socket.onopen = () =>
    socket.send(JSON.stringify({
      type: 'connection_established',
      message: 'Ready to receive audio stream',
      media_speech_id: pipeline.media_speech_id,
    }))

  socket.onmessage = pipeline.onMessage
  socket.onclose = pipeline.cleanup
  socket.onerror = pipeline.cleanup

  pipeline.deferred_media.then((media) =>
    insertSpeech(ctx.state.trx, {
      media_speech_id: pipeline.media_speech_id,
      language_code,
      ...media,
    })
  )

  pipeline.deferred_transcription.then(async (transcription) => {
    socket.send(JSON.stringify({
      type: 'transcription_finished',
      media_speech_id: pipeline.media_speech_id,
      transcription,
    }))
    await insertSpeechTranscription(ctx.state.trx, {
      transcription,
      media_speech_id: pipeline.media_speech_id,
      model: pipeline.transcription_model,
    })
  })
})
