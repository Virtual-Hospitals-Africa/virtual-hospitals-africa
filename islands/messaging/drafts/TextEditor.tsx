import { useState } from 'preact/hooks'

type TextEditorProps = {
  name: string
  initial_value: string
}

export default function TextEditor({ name, initial_value }: TextEditorProps) {
  const [value, setValue] = useState(initial_value)
  const [preview, setPreview] = useState(false)

  return (
    <div>
      <div class='flex justify-end mb-2'>
        <button
          type='button'
          onClick={() => setPreview(!preview)}
          class='text-sm text-blue-600 hover:text-blue-800'
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview
        ? (
          <div
            class='min-h-[200px] p-3 border border-gray-300 rounded-md bg-gray-50 prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        )
        : (
          <textarea
            name={name}
            value={value}
            onChange={(e) => setValue((e.target as HTMLTextAreaElement).value)}
            rows={10}
            class='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono'
            placeholder='Write your message here (Markdown supported)...'
          />
        )}
    </div>
  )
}

// Basic markdown to HTML converter
// For production, consider using a proper markdown library
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  return html
}
