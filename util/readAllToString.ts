// Helper function to read all data from a ReadableStream
export default async function readAllToString(
  reader: ReadableStream<Uint8Array>,
): Promise<string> {
  const chunks: Uint8Array[] = []
  let total_length = 0
  const stream_reader = reader.getReader()

  try {
    while (true) {
      const { done, value } = await stream_reader.read()
      if (done) break
      chunks.push(value)
      total_length += chunks.length
    }
  } finally {
    stream_reader.releaseLock()
  }

  // Combine all chunks
  const finished = new Uint8Array(total_length)
  let offset = 0
  for (const chunk of chunks) {
    finished.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(finished).trim()
}
