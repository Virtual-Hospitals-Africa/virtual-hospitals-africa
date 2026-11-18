import { useSignal } from '@preact/signals'
import { useMemo } from 'preact/hooks'
import { RenderedEmployeeWithPresenceAndSeniority } from '../types.ts'
import cls from '../util/cls.ts'
import Avatar from '../components/library/Avatar.tsx'
import { employeeDisplay } from '../util/healthWorkerDisplay.ts'
import { Priority } from '../shared/priorities.ts'
import { HiddenInput } from '../components/library/HiddenInput.tsx'
import { HealthWorkerPresence } from '../components/HealthWorkerPresence.tsx'
import OnlineIndicator from '../components/library/OnlineIndicator.tsx'
import Badge from '../components/library/Badge.tsx'
import sortBy from '../util/sortBy.ts'

export type AvailabilityInfo = {
  label: string
  priority?: Priority | null
}

type SeniorityLabel = null | 'Senior On Staff' | 'Senior On Duty'

export function ProviderSelectOption(
  { provider, selected, toggleSelection }: {
    provider: RenderedEmployeeWithPresenceAndSeniority
    selected: boolean
    availability?: AvailabilityInfo
    toggleSelection(): void
  },
) {
  const active = useSignal(false)
  const display = employeeDisplay(provider)
  const seniority_label = provider.senior_on_staff ? 'Senior On Staff' : provider.senior_on_duty ? 'Senior On Duty' : null

  return (
    <label
      id={`provider-${provider.employee_id}`}
      className={cls(
        'provider-select-option relative block cursor-pointer rounded-lg border bg-white px-4 py-3 shadow-sm focus:outline-none sm:flex sm:justify-between',
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
        <div className='relative'>
          <Avatar
            src={display.avatar_url}
            className='h-14 w-14'
          />
          <OnlineIndicator online={provider.at_work} />
        </div>
        <span className='flex flex-col'>
          <span
            id={`provider-${provider.employee_id}-label`}
            className='flex items-center gap-2 font-medium text-gray-900 text-md'
          >
            {display.display}
            {seniority_label && <Badge content={seniority_label} color='purple' round='md' />}
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
      <HealthWorkerPresence
        employee={provider}
      />
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

type TrackFormDataSomehow = {
  name?: string
  onChange?: never
} | {
  name?: never
  onChange(providers: RenderedEmployeeWithPresenceAndSeniority[]): void
}

export default function ProvidersSelect(
  { providers, name = 'employee_ids', className, onChange, initial_selected = [] }: {
    providers: RenderedEmployeeWithPresenceAndSeniority[]
    className?: string
    initial_selected?: RenderedEmployeeWithPresenceAndSeniority[]
  } & TrackFormDataSomehow,
) {
  // Compute the display order once on mount. `initial_selected` may be backed
  // by a signal that this component's onChange mutates, so re-sorting on every
  // render would shuffle just-selected providers to the front. Freeze the order.
  const providers_with_initially_selected_first = useMemo(
    () => providers.length ? sortBy(providers, (provider) => initial_selected.includes(provider) ? 0 : 1) : providers,
    [],
  )

  const selected = useSignal<Set<RenderedEmployeeWithPresenceAndSeniority>>(new Set(initial_selected))

  if (!providers.length) {
    return (
      <p className='text-gray-500 text-center py-8'>
        No providers available at this time.
      </p>
    )
  }

  return (
    <>
      <fieldset className={cls('grid md:grid-cols-2 xl:grid-cols-3 gap-2 w-full', className)}>
        {providers_with_initially_selected_first.map((provider) => (
          <ProviderSelectOption
            key={provider.employee_id}
            provider={provider}
            selected={selected.value.has(provider)}
            toggleSelection={() => {
              const new_selected = new Set(selected.value)
              selected.value.has(provider) ? new_selected.delete(provider) : new_selected.add(provider)
              selected.value = new_selected
              if (onChange) {
                onChange([...selected.value])
              }
            }}
          />
        ))}
      </fieldset>
      {!onChange && (
        <HiddenInput
          name={name}
          value={[...selected.value].map((p) => p.employee_id)}
        />
      )}
    </>
  )
}
