import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../../types.ts'

export function DueTo(
  { due_to, organization_id }: { due_to: (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]; organization_id: string },
) {
  return (
    <div class='flex flex-row gap-1 text-sm leading-5'>
      <span class='font-semibold text-gray-600'>
        {'Due to '}
      </span>

      {due_to.map((record) => (
        <MostRecentRecord
          key={record.id}
          record={record}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}
