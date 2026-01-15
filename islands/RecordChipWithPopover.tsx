import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { recordChipClassName } from '../components/drawer-v4/recordChipClassName.ts'
import { FindingPanel } from '../components/library/FindingPanel.tsx'
import { RenderedFindingRelativeToHealthWorker } from '../types.ts'

export function RecordChipWithPopover({
  record,
  organization_id,
}: {
  record: RenderedFindingRelativeToHealthWorker
  organization_id: string
}) {
  return (
    <Popover className='relative record-chip'>
      <PopoverButton className={recordChipClassName(record)}>
        {record.displays.full}
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8, padding: 8 }}
        className='panel z-50 transition duration-100 ease-out'
      >
        <FindingPanel finding={record} organization_id={organization_id} />
      </PopoverPanel>
    </Popover>
  )
}
