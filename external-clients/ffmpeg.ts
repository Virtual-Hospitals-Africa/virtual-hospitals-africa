import { deferred } from 'https://deno.land/std@0.136.0/async/deferred.ts'
import { readAll } from '../util/readAll.ts'

export function convertToWavPipeThrough(
  pipe_to: WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>,
) {
  // Create ffmpeg command for streaming conversion
  const process = new Deno.Command('ffmpeg', {
    args: [
      '-f',
      'webm', // Input format
      '-i',
      'pipe:0', // Read from stdin
      '-f',
      'wav', // Output format
      '-ar',
      '16000', // Sample rate (adjust as needed)
      '-ac',
      '1', // Mono audio
      '-y', // Overwrite output file
      'pipe:1', // write to stdout
    ],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  }).spawn()

  const writer = process.stdin.getWriter()
  const reader = process.stdout.getReader()

  const finished = deferred()

  async function piping() {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        // Write the converted audio data to transcription process
        await pipe_to.write(value)
      }
    } catch (error) {
      finished.reject(error)
    } finally {
      reader.releaseLock()
      await pipe_to.close()
    }
  }

  piping()

  async function finish() {
    await writer.close()

    // Wait for ffmpeg to finish processing
    const status = await process.status

    if (status.success) return finished.resolve()

    // Read stderr for error details
    const stderr = new TextDecoder().decode(
      await readAll(process.stderr),
    )
    return finished.reject(stderr)
  }

  return {
    writer,
    finish,
    sigterm() {
      return process.kill('SIGTERM')
    },
  }
}

export function convertToWavWriteToFile(
  file_path: string,
) {
  // Create ffmpeg command for streaming conversion
  const process = new Deno.Command('ffmpeg', {
    args: [
      '-f',
      'webm', // Input format
      '-i',
      'pipe:0', // Read from stdin
      '-f',
      'wav', // Output format
      '-ar',
      '16000', // Sample rate (adjust as needed)
      '-ac',
      '1', // Mono audio
      '-y', // Overwrite output file
      file_path, // write to stdout
    ],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  }).spawn()

  const writer = process.stdin.getWriter()

  const finished = deferred()

  async function finish() {
    await writer.close()

    // Wait for ffmpeg to finish processing
    const status = await process.status

    if (status.success) return finished.resolve()

    // Read stderr for error details
    const stderr = new TextDecoder().decode(
      await readAll(process.stderr),
    )
    return finished.reject(stderr)
  }

  return {
    writer,
    finish,
    sigterm() {
      return process.kill('SIGTERM')
    },
  }
}
