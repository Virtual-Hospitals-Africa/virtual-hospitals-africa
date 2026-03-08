import { useSignal } from '@preact/signals'
import { RenderedEmployee } from '../types.ts'
import cls from '../util/cls.ts'
import Avatar from '../components/library/Avatar.tsx'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { SqlBool } from 'kysely'
import PriorityBadge from '../components/PriorityBadge.tsx'
import { Priority } from '../shared/priorities.ts'

export type AvailabilityInfo = {
  label: string
  priority?: Priority | null
}

export function ProviderSelectOption(
  { provider, selected, toggleSelection, availability }: {
    provider: RenderedEmployee & {
      at_work?: SqlBool
    }
    selected: boolean
    toggleSelection(): void
    availability?: AvailabilityInfo
  },
) {
  const active = useSignal(false)
  const display = employeeDisplay(provider)

  return (
    <label
      className={cls(
        'provider-select-option relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between',
        active.value ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
      )}
      onMouseOver={() => active.value = true}
      onMouseLeave={() => active.value = false}
    >
      <input
        type='checkbox'
        className='sr-only'
        aria-labelledby={`provider-${provider.employee_id}-label`}
        aria-describedby={`provider-${provider.employee_id}-description-0 ${provider.employee_id}-description-1`}
        onInput={toggleSelection}
      />
      <span className='flex items-center gap-3'>
        <Avatar
          src={display.avatar_url}
          className='h-14 w-14'
        />
        <span className='flex flex-col'>
          <span
            id={`provider-${provider.employee_id}-label`}
            className='font-medium text-gray-900 text-md'
          >
            {display.display_name}
            {provider.at_work && <span className='text-xs text-green-600 font-normal'>Online</span>}
          </span>
          <span
            id={`provider-${provider.employee_id}-description-0`}
            className='text-gray-500 text-sm'
          >
            <span className='block sm:inline capitalize'>
              {display.description}
            </span>
          </span>
        </span>
      </span>
      {availability && (
        <span className='flex flex-col items-start gap-1 mt-2 sm:mt-0 sm:items-end'>
          <span className='text-xs text-gray-600'>{availability.label}</span>
          {availability.priority !== undefined && <PriorityBadge priority={availability.priority} />}
        </span>
      )}
      <span
        className={cls(
          'pointer-events-none absolute -inset-px rounded-lg border-2',
          active.value ? 'border' : 'border-2',
          selected ? 'border-indigo-600' : 'border-transparent',
        )}
        aria-hidden='true'
      />
    </label>
  )
}

export default function ProvidersSelect(
  { providers }: { providers: RenderedEmployee[] },
) {
  const selected = useSignal<Set<RenderedEmployee>>(new Set())

  return (
    <fieldset className='grid grid-cols-2 gap-2 w-full'>
      {
        /* <ProviderSelectOption
        key='next_available'
        provider={{ employee_id: 'next_available', name: 'Next Available' }}
        selected={selected.value.size === 0}
        toggleSelection={() => selected.value = new Set()}
      /> */
      }
      {providers.map((provider) => (
        <ProviderSelectOption
          key={provider.employee_id}
          provider={provider}
          selected={selected.value.has(provider)}
          toggleSelection={() => {
            const new_selected = new Set(selected.value)
            selected.value.has(provider) ? new_selected.delete(provider) : new_selected.add(provider)
            selected.value = new_selected
          }}
        />
      ))}
      {selected.value.size > 0 && (
        <input
          type='hidden'
          name='employee_ids'
          value={JSON.stringify([...selected.value].map((p) => p.employee_id))}
        />
      )}
    </fieldset>
  )
}
