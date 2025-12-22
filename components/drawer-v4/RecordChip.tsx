import { RenderedRecordRelativeToHealthWorker } from '../../types.ts'

// Individual chip component for triage levels
export function RecordChip(
  { record }: { record: RenderedRecordRelativeToHealthWorker },
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

  return (
    <div
      className={`box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[2px] relative rounded-[60px] shrink-0 ${style_class}`}
    >
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre">
        {record.value_display}
      </p>
    </div>
  )
}
