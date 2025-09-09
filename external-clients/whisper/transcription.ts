import readAllToString from '../../util/readAllToString.ts'
import readLines from '../../util/readLines.ts'
import { assert } from 'std/assert/assert.ts'
import compact from '../../util/compact.ts'

const WHISPER_MODELS_DIRECTORY_PATH = Deno.env.get(
  'WHISPER_MODELS_DIRECTORY_PATH',
)

const available_transcription_models = WHISPER_MODELS_DIRECTORY_PATH
  ? compact(
    Deno.readDirSync(WHISPER_MODELS_DIRECTORY_PATH).map((value) =>
      value.isDirectory && value.name.startsWith('whisper') && value.name
    ).toArray(),
  )
  : []

export const MODELS_TO_LANGUAGE_CODES = {
  'whisper-small-english-finetuned': 'eng',
  'whisper-large-shona': 'sna',
  'whisper-small-sesotho': 'sot',
  'whisper-large-v2-spanish': 'spa',
  'whisper-small-xhosa': 'xho',
}

const LANGUAGE_CODES_TO_MODELS = Object.fromEntries(
  Object.entries(MODELS_TO_LANGUAGE_CODES).map((
    [model, language_code],
  ) => [language_code, model]),
)

export const supported_language_codes = compact(
  available_transcription_models.map((model) =>
    MODELS_TO_LANGUAGE_CODES[model as keyof typeof MODELS_TO_LANGUAGE_CODES]
  ),
)

export function transcriptionProcess(
  language_code: string,
) {
  assert(
    WHISPER_MODELS_DIRECTORY_PATH,
    'Must set WHISPER_MODELS_DIRECTORY_PATH to transcribe audio',
  )
  assert(
    available_transcription_models.length,
    `No models found in WHISPER_MODELS_DIRECTORY_PATH ${WHISPER_MODELS_DIRECTORY_PATH}`,
  )
  assert(
    supported_language_codes.includes(language_code),
    `${language_code} is not yet supported`,
  )
  const model = `${WHISPER_MODELS_DIRECTORY_PATH}/${
    LANGUAGE_CODES_TO_MODELS[language_code]
  }`

  const process = new Deno.Command('python', {
    args: [
      './external-clients/whisper/transcribe.py',
      model,
    ],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  }).spawn()

  const writer = process.stdin.getWriter()

  const logStdErr = async () => {
    for await (const line of readLines(process.stderr)) {
      console.log(line)
    }
  }

  logStdErr()

  async function finish() {
    const transcription_status = await process.status
    assert(
      transcription_status.success,
      `Transcription failed with exit code: ${transcription_status.code}`,
    )

    return readAllToString(process.stdout)
  }

  return {
    model,
    async transcribe(file_path: string) {
      await writer.write(new TextEncoder().encode(file_path))
      await writer.close()
      return finish()
    },
  }
}
