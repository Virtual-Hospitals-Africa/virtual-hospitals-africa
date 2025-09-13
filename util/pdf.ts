import { runCommandAssertExitCodeZero } from './command.ts'
import generateUUID from './uuid.ts'

export async function generate(url: string): Promise<string> {
  const file_path = `temp_files/${generateUUID()}.pdf`

  await runCommandAssertExitCodeZero('wkhtmltopdf', {
    args: [url, file_path],
  })

  return file_path
}

export async function remove(filePath: string): Promise<void> {
  try {
    await Deno.remove(filePath)
    // console.log(`File deleted: ${filePath}`);
  } catch (err) {
    console.error(
      `Error deleting file: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}
