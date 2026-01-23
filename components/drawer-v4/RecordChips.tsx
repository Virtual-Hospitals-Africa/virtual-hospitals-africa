import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import { RecordChipWithPopover } from '../../islands/RecordChipWithPopover.tsx'

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
        <RecordChipWithPopover
          key={record.id}
          record={record}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}
