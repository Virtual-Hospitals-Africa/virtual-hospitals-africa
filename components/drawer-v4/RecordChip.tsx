import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { FindingPanel } from '../library/FindingPanel.tsx'
import { recordChipClassName } from './recordChipClassName.ts'

export function RecordChips(
  { records, organization_id }: {
    records: RenderedFindingRelativeToHealthWorker[]
    organization_id: string
  },
) {
  if (!records.length) return null
  return (
    <div className='box-border content-center flex flex-wrap gap-1 items-center justify-start px-px py-0 shrink-0 w-full'>
      {records.map((record) => (
        <RecordChip
          key={record.record_id}
          record={record}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}

export function RecordChip({
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
