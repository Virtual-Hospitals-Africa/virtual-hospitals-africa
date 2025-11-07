import { useState } from 'preact/hooks'
import { RenderedMessageDraftTarget } from '../../../types.ts'

type RecipientRowProps = {
  target: RenderedMessageDraftTarget | null
  index: number
}

export default function RecipientRow({ target, index }: RecipientRowProps) {
  const [tableType, setTableType] = useState(
    target?.table_name ?? 'organizations',
  )
  const [value, setValue] = useState(target?.display_name ?? '')

  const handleRemove = () => {
    // TODO: Implement remove logic
    console.log('Remove target', index)
  }

  return (
    <div class='flex items-center space-x-2'>
      <select
        name={`targets[${index}][table_name]`}
        value={tableType}
        onChange={(e) =>
          setTableType((e.target as HTMLSelectElement).value as any)}
        class='block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
      >
        <option value='organizations'>Organization</option>
        <option value='employment'>Person</option>
        <option value='profession'>Profession</option>
        <option value='region'>Region</option>
      </select>

      <input
        type='text'
        name={`targets[${index}][value]`}
        value={value}
        onChange={(e) => setValue((e.target as HTMLInputElement).value)}
        placeholder='Search or select...'
        class='flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
      />

      {target && (
        <button
          type='button'
          onClick={handleRemove}
          class='p-2 text-gray-400 hover:text-gray-600'
          title='Remove recipient'
        >
          <svg
            class='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      )}
    </div>
  )
}
