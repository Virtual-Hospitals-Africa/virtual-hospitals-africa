import { keys } from '../../util/keys.ts'
import { readAll } from '../../util/readAll.ts'

export const language_models = {
  'eng':
    '/Users/willweiss/dev/morehumaninternet/whisper-small-english-finetuned',
  'sna': '/Users/willweiss/dev/morehumaninternet/whisper-large-shona',
  'sot': '/Users/willweiss/dev/morehumaninternet/whisper-small-sesotho',
  'spa': '/Users/willweiss/dev/morehumaninternet/whisper-large-v2-spanish',
  'xho': '/Users/willweiss/dev/morehumaninternet/whisper-small-xhosa',
}

export const supported_languages = keys(language_models)

export type TranscriptionSupportedLanguageCode =
  (typeof supported_languages)[number]

export function transcriptionProcess(
  language_code: TranscriptionSupportedLanguageCode,
) {
  const model = language_models[language_code]

  const process = new Deno.Command('python', {
    args: [
      './external-clients/whisper/transcribe.py',
      model,
      '-',
    ],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  }).spawn()

  const writer = process.stdin.getWriter()

  async function finish() {
    const transcription_status = await process.status
    if (!transcription_status.success) {
      const stderr = new TextDecoder().decode(
        await readAll(process.stderr),
      )
      throw new Error(`Transcription failed: ${stderr}`)
    }

    return new TextDecoder().decode(
      await readAll(process.stdout),
    ).trim()
  }

  return {
    model,
    async transcribe(file_path: string) {
      await writer.write(new TextEncoder().encode(file_path))
      return finish()
    },
  }
}
