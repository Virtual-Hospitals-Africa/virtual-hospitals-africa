export function logToFile(text: string) {
  const filename = Deno.makeTempFileSync()
  Deno.writeTextFileSync(filename, text)
  return filename
}
