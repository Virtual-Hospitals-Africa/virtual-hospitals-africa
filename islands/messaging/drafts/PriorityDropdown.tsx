import { useState } from 'preact/hooks'
import {
  PRIORITIES,
  Priority,
  PRIORITY_COLORS,
} from '../../../shared/priorities.ts'
import { ChevronDownIcon } from '../../../components/library/icons/heroicons/outline.tsx'

type PriorityDropdownProps = {
  name: string
  initial_priority?: string | null
}

export default function PriorityDropdown(
  { name, initial_priority }: PriorityDropdownProps,
) {
  const [priority, setPriority] = useState<string>(
    initial_priority ?? 'Emergency',
  )
  const [isOpen, setIsOpen] = useState(false)

  const currentPriority = priority as Priority
  const colors = PRIORITY_COLORS[currentPriority] || PRIORITY_COLORS['Normal']

  return (
    <div class='relative'>
      <input type='hidden' name={name} value={priority} />

      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        class={`flex items-center gap-2 px-4 py-2 rounded-md border ${colors.border} ${colors.bg} ${colors.text} font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {priority}
        <ChevronDownIcon className='w-4 h-4' />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            class='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div class='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20'>
            <div class='py-1' role='menu'>
              {PRIORITIES.map((p) => {
                const priorityColors = PRIORITY_COLORS[p]
                return (
                  <button
                    key={p}
                    type='button'
                    onClick={() => {
                      setPriority(p)
                      setIsOpen(false)
                    }}
                    class={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      priority === p ? 'bg-gray-50' : ''
                    }`}
                    role='menuitem'
                  >
                    <span
                      class={`inline-flex items-center px-2.5 py-0.5 rounded-md ${priorityColors.bg} ${priorityColors.text} font-medium`}
                    >
                      {p}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
