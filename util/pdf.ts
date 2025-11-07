import { runCommandAssertExitCodeZero } from './command.ts'
import generateUUID from './uuid.ts'

export async function generate(url: string): Promise<string> {
  const file_path = `temp_files/${generateUUID()}.pdf`

  await runCommandAssertExitCodeZero('wkhtmltopdf', {
    args: [url, file_path],
  })

  return file_path
}

export async function remove(file_path: string): Promise<void> {
  try {
    await Deno.remove(file_path)
    // console.log(`File deleted: ${file_path}`);
  } catch (err) {
    console.error(
      `Error deleting file: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}
