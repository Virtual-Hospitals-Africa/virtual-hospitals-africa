// Helper function to read all data from a ReadableStream
export async function readAll(
  reader: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  const streamReader = reader.getReader()

  try {
    while (true) {
      const { done, value } = await streamReader.read()
      if (done) break
      chunks.push(value)
    }
  } finally {
    streamReader.releaseLock()
  }

  // Combine all chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const finished = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    finished.set(chunk, offset)
    offset += chunk.length
  }

  return finished
}
