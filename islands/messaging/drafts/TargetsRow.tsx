import { Signal, useSignal } from '@preact/signals'
import { useRef } from 'preact/hooks'
import RemovableChip from '../../../components/RemovableChip.tsx'
import { MessageTargetType } from '../../../db.d.ts'
import remove from '../../../util/remove.ts'
import { ComponentChildren } from 'preact'

type Target<TargetType extends MessageTargetType> = {
  target_type: TargetType
  target_value: string
  display_name: string
}

type TargetsRowProps<TargetType extends MessageTargetType> = {
  label: string
  target_types: TargetType[]
  targets: Target<TargetType>[]
  children?: ComponentChildren
}

// Mock data for search results
const MOCK_TARGETS = [
  { target_type: 'employment', target_value: '1', display_name: 'John Smith' },
  { target_type: 'employment', target_value: '2', display_name: 'Jane Doe' },
  { target_type: 'employment', target_value: '3', display_name: 'Bob Johnson' },
  {
    target_type: 'employment',
    target_value: '1',
    display_name: 'Dr. Sarah Williams',
  },
  {
    target_type: 'employment',
    target_value: '2',
    display_name: 'Nurse Emily Davis',
  },
  {
    target_type: 'employment',
    target_value: '3',
    display_name: 'Dr. Michael Brown',
  },
]

function TargetsInput<TargetType extends MessageTargetType>(
  { targets_signal }: { targets_signal: Signal<Target<TargetType>[]> },
) {
  const search_query = useSignal('')
  const show_results = useSignal(false)
  const input_ref = useRef<HTMLInputElement>(null)

  const filtered_results = search_query.value.trim()
    ? MOCK_TARGETS.filter((target) =>
      target.display_name.toLowerCase().includes(
        search_query.value.toLowerCase(),
      )
    )
    : []

  const handleSelect = (target: typeof MOCK_TARGETS[number]) => {
    targets_signal.value = [
      ...targets_signal.value,
      target as unknown as Target<TargetType>,
    ]
    search_query.value = ''
    show_results.value = false
    input_ref.current?.focus()
  }

  return (
    <div class='relative flex-1'>
      <div class='flex flex-wrap gap-2 items-center bg-white'>
        {targets_signal.value.map((target) => (
          <RemovableChip
            key={target}
            name={`targets.${target.target_type}.${target.target_value}`}
            display={target.display_name}
            remove={() =>
              targets_signal.value = remove(targets_signal.value, target)}
          />
        ))}
        <input
          ref={input_ref}
          type='text'
          class='flex-1 min-w-[200px] outline-none border-none focus:ring-0 p-0'
          placeholder='Search recipients...'
          value={search_query.value}
          onInput={(e) => {
            search_query.value = (e.target as HTMLInputElement).value
            show_results.value = true
          }}
          onFocus={() => show_results.value = true}
          onBlur={() => {
            // Delay to allow click events on results
            setTimeout(() => show_results.value = false, 200)
          }}
        />
      </div>
      {show_results.value && filtered_results.length > 0 && (
        <div class='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
          {filtered_results.map((result) => (
            <button
              key={`${result.target_type}-${result.target_value}`}
              type='button'
              class='w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer'
              onClick={() => handleSelect(result)}
            >
              <div class='font-medium'>{result.display_name}</div>
              <div class='text-sm text-gray-500 capitalize'>
                {result.target_type.replace('_', ' ')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TargetsRow<TargetType extends MessageTargetType>({
  label,
  target_types: _target_types,
  targets,
  children,
}: TargetsRowProps<TargetType>) {
  const targets_signal = useSignal(targets)

  return (
    <div class='flex items-center gap-2 px-6 py-3 border-b border-gray-200'>
      <label class='text-sm text-gray-700 w-24 flex-shrink-0'>
        {label}
      </label>
      <div class='flex flex-col gap-2 flex-1'>
        <TargetsInput targets_signal={targets_signal} />
        {children}
      </div>
    </div>
  )
}
