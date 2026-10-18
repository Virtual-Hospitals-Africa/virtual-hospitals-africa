// Writing to stdout in full: Deno.stdout.writeSync may take fewer bytes than it is given (a full pipe).
const encoder = new TextEncoder()

export function writeOut(text: string) {
  let bytes = encoder.encode(text)
  while (bytes.length > 0) bytes = bytes.subarray(Deno.stdout.writeSync(bytes))
}
