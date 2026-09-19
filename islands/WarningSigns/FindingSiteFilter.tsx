import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { FunnelIcon } from '../../components/library/icons/heroicons/mini.tsx'
import { FindingSiteWithMaybeRecords, Maybe } from '../../types.ts'
import cls from '../../util/cls.ts'
import { hyphenate } from '../../util/hyphenate.ts'

/*
  Narrows the warning signs page to one body site: its guide page's findings take the place
  of the warning signs, and a search returns only findings sited there or nowhere in particular.
*/
export function FindingSiteFilter({ finding_sites, selected, onSelect }: {
  finding_sites: FindingSiteWithMaybeRecords[]
  selected: Maybe<FindingSiteWithMaybeRecords>
  onSelect(finding_site: null | FindingSiteWithMaybeRecords): void
}) {
  return (
    <Popover id='warning-signs-finding-site-filter' className='relative shrink-0'>
      {({ close }: { close: () => void }) => (
        <>
          <PopoverButton
            title='Filter by body site'
            className={cls(
              'flex items-center gap-1 h-full rounded-md px-2 py-1.5 text-sm font-medium outline -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600',
              selected ? 'bg-indigo-50 text-indigo-700 outline-indigo-300' : 'bg-white text-gray-600 outline-gray-300',
            )}
          >
            <FunnelIcon className='h-4 w-4' aria-hidden='true' />
            <span>{selected ? selected.label : 'Body site'}</span>
          </PopoverButton>
          <PopoverPanel
            anchor='bottom end'
            className='z-20 mt-1 w-48 max-h-80 overflow-y-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none'
          >
            {selected && (
              <button
                type='button'
                id='warning-signs-finding-site-clear'
                className='w-full rounded px-2 py-1.5 text-left text-gray-500 hover:bg-gray-50'
                onClick={() => {
                  onSelect(null)
                  close()
                }}
              >
                Clear filter
              </button>
            )}
            {finding_sites.map((finding_site) => (
              <button
                type='button'
                key={finding_site.label}
                id={`warning-signs-finding-site-${hyphenate(finding_site.label.toLowerCase())}`}
                className={cls(
                  'w-full rounded px-2 py-1.5 text-left hover:bg-indigo-50',
                  selected?.label === finding_site.label ? 'font-semibold text-indigo-700' : 'text-gray-700',
                )}
                onClick={() => {
                  onSelect(finding_site)
                  close()
                }}
              >
                {finding_site.label}
              </button>
            ))}
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
