// import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { recordChipClassName } from '../components/drawer-v4/recordChipClassName.ts'
import { RecordPanel } from '../components/library/RecordPanel.tsx'
import { RenderedRecordRelativeToHealthWorker } from '../types.ts'
import { hyphenate } from '../util/hyphenate.ts'

export function RecordChipWithPopover({
  record,
  organization_id,
}: {
  record: RenderedRecordRelativeToHealthWorker
  organization_id: string
}) {
  console.log({ record })
  return (
    <div className='relative record-chip' id={'record-chip-' + hyphenate(record.displays.full)}>
      <button className={recordChipClassName(record)}>
        {record.displays.full}
      </button>
      <div // anchor={{ to: 'bottom start', gap: 8, padding: 8 }}
       className='panel z-50 transition duration-100 ease-out'>
        <RecordPanel record={record} organization_id={organization_id} />
      </div>
    </div>
  )
}
