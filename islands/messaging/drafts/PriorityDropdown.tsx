import { useSignal } from '@preact/signals'
import {
  PRIORITIES,
  Priority,
  PRIORITY_COLORS,
} from '../../../shared/priorities.ts'
import { ChevronDownIcon } from '../../../components/library/icons/heroicons/outline.tsx'
import { Maybe } from '../../../types.ts'
import remove from '../../../util/remove.ts'

type PriorityDropdownProps = {
  name: string
  initial_priority?: Maybe<Priority>
}

export default function PriorityDropdown(
  { name, initial_priority }: PriorityDropdownProps,
) {
  const priority = useSignal<Priority>(
    initial_priority ?? 'Non-urgent',
  )
  const open = useSignal(false)

  const colors = PRIORITY_COLORS[priority.value]

  return (
    <div class='relative'>
      <input type='hidden' name={name} value={priority} />

      <button
        type='button'
        onClick={() => open.value = !open.value}
        class={`flex items-center gap-2 px-4 py-2 rounded-md border ${colors.border} ${colors.bg} ${colors.text} font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {priority}
        <ChevronDownIcon className='w-4 h-4' />
      </button>

      {open.value && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            class='fixed inset-0 z-10'
            onClick={() => open.value = false}
          />

          {/* Dropdown menu */}
          <div class='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20'>
            <div class='py-1' role='menu'>
              {remove(PRIORITIES, 'Deceased', 'Normal').map((p) => {
                const colors = PRIORITY_COLORS[p]
                return (
                  <button
                    key={p}
                    type='button'
                    onClick={() => {
                      priority.value = p
                      open.value = false
                    }}
                    class={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      priority.value === p ? 'bg-gray-50' : ''
                    }`}
                    role='menuitem'
                  >
                    <span
                      class={`inline-flex items-center px-2.5 py-0.5 rounded-md ${colors.bg} ${colors.text} font-medium`}
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
