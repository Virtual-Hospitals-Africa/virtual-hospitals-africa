import { RenderedRecordRelativeToHealthWorker } from '../../types.ts'
import { FindingPanel } from '../library/FindingPanel.tsx'

export function RecordChips(
  { records, organization_id }: {
    records: RenderedRecordRelativeToHealthWorker[]
    organization_id: string
  },
) {
  if (!records.length) return null
  return (
    <div className='box-border content-center flex flex-wrap gap-[8px] items-center justify-start px-px py-0 shrink-0 w-full'>
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

// Individual chip component for triage levels
export function RecordChip(
  { record, organization_id }: {
    record: RenderedRecordRelativeToHealthWorker
    organization_id: string
  },
) {
  // const priority_styles = {
  //   'Emergency': 'bg-red-100 text-red-800',
  //   'Very urgent': 'bg-orange-100 text-orange-700',
  //   'Urgent': 'bg-yellow-100 text-yellow-800',
  //   'Non-urgent': 'bg-green-100 text-green-800',
  //   'Normal': 'bg-gray-100 text-gray-600',
  //   'Deceased': 'bg-blue-100 text-blue-800',
  // }

  const style_class = 'bg-gray-100 text-gray-600'

  // TODO
  return (
    <div
      className={`group box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[2px] rounded-[60px] shrink-0 relative ${style_class}`}
    >
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre">
        {record.value_display}
      </p>
      <div className='absolute left-0 z-50 hidden pt-2 top-full group-hover:block hover:block'>
        <FindingPanel finding={record} organization_id={organization_id} />
      </div>
    </div>
  )
}
