import fs from 'node:fs'
import crypto from 'node:crypto'
import { runCommand } from './command.ts'

export async function generatePDF(url: string): Promise<string> {
  const filename = crypto.createHash('md5').update(url).digest('hex')
  const outputPath = `temp_files/${filename}.pdf`

  await runCommand('wkhtmltopdf', {
    args: [url, outputPath],
  })

  return outputPath
}

export function deletePDF(filePath: string): void {
  fs.unlink(filePath, (err: Error | null) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`)
    } else {
      // console.log(`File deleted: ${filePath}`);
    }
  })
}
