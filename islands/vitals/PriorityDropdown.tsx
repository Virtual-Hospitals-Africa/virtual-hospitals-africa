import { Menu } from '@headlessui/react'
import { useSignal } from '@preact/signals'
import { useRef } from 'preact/hooks'
import { FlagIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { PRIORITIES, Priority } from '../../types.ts'
import cls from '../../util/cls.ts'
import { Fragment } from 'preact'

const PRIORITY_COLORS: Record<
  Priority,
  { bg: string; text: string; border: string }
> = {
  Normal: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  'Non-urgent': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  Urgent: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  'Very urgent': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  Emergency: {
    bg: 'bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
  },
  Deceased: {
    bg: 'bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
  },
}

interface PriorityDropdownProps {
  name: string
  vitalName: string
  initialPriority?: Priority
}

export default function PriorityDropdown({
  name,
  vitalName,
  initialPriority,
}: PriorityDropdownProps) {
  // Default to "Normal" for SNOMED CT compliance - all evaluations must have a priority
  const selected_priority = useSignal<Priority>(initialPriority || 'Normal')
  const button_ref = useRef<HTMLButtonElement>(null)
  const should_open_upward = useSignal(false)
  const checkSpaceAndPosition = () => {
    if (!button_ref.current) return

    const button_rect = button_ref.current.getBoundingClientRect()
    const viewport_height = globalThis.innerHeight
    const dropdown_height = 240 // Approximate height of dropdown
    const space_below = viewport_height - button_rect.bottom
    const space_above = button_rect.top

    // Open upward if there's not enough space below but enough space above
    should_open_upward.value = space_below < dropdown_height &&
      space_above > dropdown_height
  }

  const getButtonStyles = () => {
    return selected_priority.value === 'Emergency'
      ? 'border-red-400 bg-red-200 text-red-900 hover:bg-red-300'
      : selected_priority.value === 'Very urgent'
      ? 'border-red-300 bg-red-100 text-red-800 hover:bg-red-200'
      : selected_priority.value === 'Urgent'
      ? 'border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      : selected_priority.value === 'Non-urgent'
      ? 'border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200'
      : 'border-green-300 bg-green-100 text-green-800 hover:bg-green-200' // Normal
  }

  return (
    <div className='relative'>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button as={Fragment}>
            <button
              ref={button_ref}
              type='button'
              className={cls(
                'inline-flex justify-center items-center size-12 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current',
                getButtonStyles(),
              )}
              title={`Flag ${vitalName} - ${selected_priority.value}`}
              onClick={checkSpaceAndPosition}
            >
              <FlagIcon className='size-5 opacity-60' />
            </button>
          </Menu.Button>
        </div>

        <Menu.Items
          className={cls(
            'absolute z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none',
            should_open_upward.value
              ? 'bottom-full mb-2 right-0 origin-bottom-right'
              : 'top-full mt-2 right-0 origin-top-right',
          )}
        >
          <div className='py-1'>
            {/* Priority options - all evaluations must have a priority per SNOMED CT compliance */}
            {PRIORITIES.map((priority) => {
              const colors = PRIORITY_COLORS[priority]
              return (
                <Menu.Item key={priority}>
                  {({ focus }: { focus: boolean }) => (
                    <button
                      type='button'
                      onClick={() => (selected_priority.value = priority)}
                      className={cls(
                        'flex items-center w-full px-4 py-2 text-sm text-left',
                        focus ? 'bg-gray-100' : '',
                        selected_priority.value === priority
                          ? 'bg-gray-50'
                          : '',
                      )}
                    >
                      <div
                        className={cls(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3',
                          colors.bg,
                          colors.text,
                          `border ${colors.border}`,
                        )}
                      >
                        {priority}
                      </div>
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Menu>

      <HiddenInput name={`${name}.priority`} value={selected_priority.value} />
    </div>
  )
}
