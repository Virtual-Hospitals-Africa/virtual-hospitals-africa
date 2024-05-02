import { useSignal } from '@preact/signals'
import { Maybe, OrganizationDoctorOrNurse } from '../types.ts'
import cls from '../util/cls.ts'
import Avatar from '../components/library/Avatar.tsx'
import words from '../util/words.ts'

function ProviderSelectOption(
  { provider, selected, toggleSelection }: {
    provider: {
      employee_id: string | 'next_available'
      name: string
      avatar_url?: Maybe<string>
      profession?: Maybe<string>
      specialty?: Maybe<string>
    }
    selected: boolean
    toggleSelection(): void
  },
) {
  const active = useSignal(false)

  return (
    <label
      className={cls(
        'relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none sm:flex sm:justify-between',
        active.value
          ? 'border-indigo-600 ring-2 ring-indigo-600'
          : 'border-gray-300',
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
          src={provider.avatar_url}
          className='h-14 w-14'
        />
        <span className='flex flex-col'>
          <span
            id={`provider-${provider.employee_id}-label`}
            className='font-medium text-gray-900 text-md'
          >
            {provider.name}
          </span>
          {provider.profession && (
            <span
              id={`provider-${provider.employee_id}-description-0`}
              className='text-gray-500 text-sm'
            >
              <span className='block sm:inline capitalize'>
                {provider.profession}
              </span>
              {provider.specialty && (
                <>
                  <span className='hidden sm:mx-1 sm:inline' aria-hidden='true'>
                    ·
                  </span>
                  <span className='block sm:inline capitalize'>
                    {words(provider.specialty).join(' ')}
                  </span>
                </>
              )}
            </span>
          )}
        </span>
      </span>
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
  { providers }: { providers: OrganizationDoctorOrNurse[] },
) {
  const selected = useSignal<Set<OrganizationDoctorOrNurse>>(new Set())

  return (
    <fieldset className='grid grid-cols-2 gap-2 w-full'>
      <ProviderSelectOption
        key='next_available'
        provider={{ employee_id: 'next_available', name: 'Next Available' }}
        selected={selected.value.size === 0}
        toggleSelection={() => selected.value = new Set()}
      />
      {providers.map((provider) => (
        <ProviderSelectOption
          key={provider.employee_id}
          provider={provider}
          selected={selected.value.has(provider)}
          toggleSelection={() => {
            const newSelected = new Set(selected.value)
            selected.value.has(provider)
              ? newSelected.delete(provider)
              : newSelected.add(provider)
            selected.value = newSelected
          }}
        />
      ))}
      {selected.value.size > 0 && (
        <input
          type='hidden'
          name='provider_ids'
          value={JSON.stringify([...selected.value].map((p) => p.employee_id))}
        />
      )}
    </fieldset>
  )
}
