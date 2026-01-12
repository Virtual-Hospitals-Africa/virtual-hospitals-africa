import { useRef, useState } from 'preact/hooks'
import { LinkIcon, ListBulletIcon, PhotoIcon } from '../../../components/library/icons/heroicons/outline.tsx'

type RichTextEditorProps = {
  name: string
  initial_value: string
}

export default function RichTextEditor(
  { name, initial_value }: RichTextEditorProps,
) {
  const [value, setValue] = useState(
    initial_value ||
      "I'm concerned because the patient is pregnant. Should they be on this medication?",
  )
  const textarea_ref = useRef<HTMLTextAreaElement>(null)
  const editor_ref = useRef<HTMLDivElement>(null)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Update the value state after command execution
    if (editor_ref.current) {
      setValue(editor_ref.current.innerHTML)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const toolbar_buttons = [
    { icon: 'B', title: 'Bold', command: 'bold', className: 'font-bold' },
    { icon: 'I', title: 'Italic', command: 'italic', className: 'italic' },
    {
      icon: 'H',
      title: 'Heading 1',
      command: 'formatBlock',
      value: 'H1',
      className: 'font-bold text-lg',
    },
    {
      icon: 'H',
      title: 'Heading 2',
      command: 'formatBlock',
      value: 'H2',
      className: 'font-semibold',
    },
    { icon: '""', title: 'Quote', command: 'formatBlock', value: 'BLOCKQUOTE' },
  ]

  return (
    <div class='border border-gray-300 rounded-md overflow-hidden'>
      {/* Hidden textarea to store the actual value for form submission */}
      <textarea
        ref={textarea_ref}
        name={name}
        value={value}
        class='hidden'
      />

      {/* Toolbar */}
      <div class='flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-300'>
        {/* Text formatting buttons */}
        {toolbar_buttons.map((btn, idx) => (
          <button
            key={idx}
            type='button'
            onClick={() => execCommand(btn.command, btn.value)}
            title={btn.title}
            class={`p-2 hover:bg-gray-200 rounded transition-colors ${btn.className || ''}`}
          >
            {btn.icon}
          </button>
        ))}

        {/* Link button */}
        <button
          type='button'
          onClick={insertLink}
          title='Insert Link'
          class='p-2 hover:bg-gray-200 rounded transition-colors'
        >
          <LinkIcon className='w-5 h-5 text-gray-700' />
        </button>

        {/* Image button */}
        <button
          type='button'
          onClick={insertImage}
          title='Insert Image'
          class='p-2 hover:bg-gray-200 rounded transition-colors'
        >
          <PhotoIcon className='w-5 h-5 text-gray-700' />
        </button>

        {/* Bullet list button */}
        <button
          type='button'
          onClick={() => execCommand('insertUnorderedList')}
          title='Bullet List'
          class='p-2 hover:bg-gray-200 rounded transition-colors'
        >
          <ListBulletIcon className='w-5 h-5 text-gray-700' />
        </button>

        {/* Numbered list button */}
        <button
          type='button'
          onClick={() => execCommand('insertOrderedList')}
          title='Numbered List'
          class='p-2 hover:bg-gray-200 rounded transition-colors'
        >
          <svg
            className='w-5 h-5 text-gray-700'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4h3v2H3V4zm0 4h3v2H3V8zm0 4h3v2H3v-2zm0 4h3v2H3v-2zM9 5h11M9 9h11M9 13h11M9 17h11'
            />
          </svg>
        </button>
      </div>

      {/* Content editable area */}
      <div
        ref={editor_ref}
        contentEditable
        onInput={(e) => {
          const content = (e.target as HTMLDivElement).innerHTML
          setValue(content)
        }}
        class='min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none'
        // deno-lint-ignore react-no-danger
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}
