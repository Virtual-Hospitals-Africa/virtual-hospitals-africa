import { exec } from 'node:child_process';
import util from 'node:util';
import fs from 'node:fs';
import crypto from 'node:crypto';

const prefix = 'https://localhost:8000';
const execPromise = util.promisify(exec);

export async function generatePDF(url: string): Promise<string> {
  const filename = crypto.createHash('md5').update(url).digest('hex');
  const outputPath = `../${filename}.pdf`; // Should I create a temporary space to store the file? If so, what should I name it?
  const fullUrl = url.startsWith(prefix) ? url : `${prefix}${url}`;
  const command = `wkhtmltopdf ${fullUrl} ${outputPath}`;

  try {
    await execPromise(command);
    // console.log(`PDF generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating PDF: ${error}`);
    throw error;
  }
}

export function deletePDF(filePath: string): void {
    fs.unlink(filePath, (err: { message: Error }) => {
      if (err) {
        console.error(`Error deleting file: ${err.message}`);
      } else {
        // console.log(`File deleted: ${filePath}`);
      }
    });
  }