import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { FindingSiteIcon, WHOLE_BODY_LABEL } from '../../components/library/icons/finding_sites.tsx'
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
  // 'Whole body' heads the list as the way to clear the filter, and stands in on the button
  // for no filter at all, so the button and the panel draw from one set of labels.
  const labels = [WHOLE_BODY_LABEL, ...finding_sites.map(({ label }) => label)]
  const shown = selected ? selected.label : WHOLE_BODY_LABEL

  // The button pads by the panel's p-1 plus a row's px-2, putting a row's icon and label at the
  // same offsets as the button's, so the two come out the same width to the pixel rather than
  // by a number we guessed. What that width is the labels below decide.
  const button_class = cls(
    'flex items-center gap-2 h-full rounded-md px-3 py-1.5 text-sm font-medium outline -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600',
    selected ? 'bg-indigo-50 text-indigo-700 outline-indigo-300' : 'bg-white text-gray-600 outline-gray-300',
  )

  return (
    <Popover id='warning-signs-finding-site-filter' className='relative shrink-0'>
      {({ close }: { close: () => void }) => (
        <>
          <PopoverButton title='Filter by body site' className={button_class}>
            <FindingSiteIcon label={shown} className='size-5 shrink-0' aria-hidden='true' />
            <span className='grid'>
              <span className='col-start-1 row-start-1 text-left'>{shown}</span>
              {
                /* Every label stacked in the one grid cell, measured but never drawn, widening the
                  button to the longest of them. font-semibold is the heaviest a row is drawn in. */
              }
              <span aria-hidden='true' className='col-start-1 row-start-1 h-0 overflow-hidden font-semibold'>
                {labels.map((label) => <span key={label} className='block'>{label}</span>)}
              </span>
            </span>
          </PopoverButton>
          <PopoverPanel
            anchor='bottom end'
            className='z-20 mt-1 w-[var(--button-width)] max-h-80 overflow-y-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none'
          >
            {/* Clears the filter: the page goes back to the warning signs, sited anywhere on the body */}
            <button
              type='button'
              id={`warning-signs-finding-site-${hyphenate(WHOLE_BODY_LABEL.toLowerCase())}`}
              className={cls(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-indigo-50',
                selected ? 'text-gray-700' : 'font-semibold text-indigo-700',
              )}
              onClick={() => {
                onSelect(null)
                close()
              }}
            >
              <FindingSiteIcon label={WHOLE_BODY_LABEL} className='size-5 shrink-0' aria-hidden='true' />
              <span className='truncate'>{WHOLE_BODY_LABEL}</span>
            </button>
            {finding_sites.map((finding_site) => (
              <button
                type='button'
                key={finding_site.label}
                id={`warning-signs-finding-site-${hyphenate(finding_site.label.toLowerCase())}`}
                className={cls(
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-indigo-50',
                  selected?.label === finding_site.label ? 'font-semibold text-indigo-700' : 'text-gray-700',
                )}
                onClick={() => {
                  onSelect(finding_site)
                  close()
                }}
              >
                <FindingSiteIcon label={finding_site.label} className='size-5 shrink-0' aria-hidden='true' />
                <span className='truncate'>{finding_site.label}</span>
              </button>
            ))}
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
