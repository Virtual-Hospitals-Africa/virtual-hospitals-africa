import { PageProps } from 'fresh'
import PdfViewer from '../islands/PdfViewer.tsx'

export default function ViewPdfPage({ url }: PageProps) {
  const file = url.searchParams.get('file') ?? ''

  if (!file || file.includes('..')) {
    return (
      <div class='flex items-center justify-center h-screen bg-gray-900 text-white'>
        <p>Invalid file parameter.</p>
      </div>
    )
  }

  const file_url = `/${file}`

  return <PdfViewer file_url={file_url} />
}
