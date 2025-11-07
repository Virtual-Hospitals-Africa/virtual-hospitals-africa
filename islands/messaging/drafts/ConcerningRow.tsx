import { useState } from 'preact/hooks'

type ConcerningRowProps = {
  initial_concerning: boolean
}

export default function ConcerningRow(
  { initial_concerning }: ConcerningRowProps,
) {
  const [concerning, setConcerning] = useState(initial_concerning)

  return (
    <div class='flex items-center'>
      <input
        type='checkbox'
        name='concerning'
        id='concerning'
        checked={concerning}
        onChange={(e) => setConcerning((e.target as HTMLInputElement).checked)}
        class='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
      />
      <label htmlFor='concerning' class='ml-2 block text-sm text-gray-900'>
        Mark as concerning
      </label>
    </div>
  )
}
