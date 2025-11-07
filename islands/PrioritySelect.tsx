import { useState } from 'preact/hooks'
import { PRIORITIES } from '../shared/priorities.ts'

type PrioritySelectProps = {
  name: string
  initial_priority?: string | null
}

export default function PrioritySelect(
  { name, initial_priority }: PrioritySelectProps,
) {
  const [priority, setPriority] = useState(initial_priority ?? '')

  return (
    <select
      name={name}
      value={priority}
      onChange={(e) => setPriority((e.target as HTMLSelectElement).value)}
      class='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
    >
      <option value=''>Select priority...</option>
      {PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  )
}
