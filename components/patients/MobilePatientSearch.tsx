import { AdjustmentsVerticalIcon } from '../library/icons/heroicons/outline.tsx'
import SelectInput, { SelectOption } from '../dashboard/filters/SelectInput.tsx'

export function MobilePatientSearch({
  action,
  search,
  sex,
  registration_status,
  sex_options,
  registration_options,
}: {
  action: string
  search?: string
  sex: string | null
  registration_status: 'complete' | 'incomplete' | null
  sex_options: readonly SelectOption[]
  registration_options: readonly SelectOption[]
}) {
  return (
    <form method='get' action={action} className='md:hidden'>
      <input id='patient-filters' type='checkbox' className='peer sr-only' />
      <div className='flex items-center gap-2'>
        <input
          type='search'
          name='search'
          value={search ?? ''}
          placeholder='Search patients...'
          className="h-11 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-4 font-['Inter'] text-base font-normal leading-6 text-gray-900 placeholder:text-gray-500"
        />
        <label
          for='patient-filters'
          aria-label='Filters'
          className='flex size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-3 text-indigo-700'
        >
          <AdjustmentsVerticalIcon />
        </label>
      </div>
      <div className='mt-2 hidden flex-wrap items-end gap-3 peer-checked:flex'>
        <SelectInput param='sex' value={sex} options={sex_options} />
        <SelectInput
          param='registration_status'
          value={registration_status}
          options={registration_options}
          placeholder='All'
        />
        <button
          type='submit'
          className='rounded bg-gray-900 px-3 py-1 text-sm text-white'
        >
          Apply
        </button>
      </div>
    </form>
  )
}
