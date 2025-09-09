import readAllChunks from './readAllChunks.ts'

export default async function readAllToString(
  reader: ReadableStream<Uint8Array>,
): Promise<string> {
  const { chunks, total_length } = await readAllChunks(reader)

  const finished = new Uint8Array(total_length)
  let offset = 0
  for (const chunk of chunks) {
    finished.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(finished).trim()
}
