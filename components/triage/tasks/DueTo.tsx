import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../../types.ts'
import cls from '../../../util/cls.ts'

export function DueTo(
  { due_to, organization_id, className }: {
    due_to: (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]
    organization_id: string
    className?: string
  },
) {
  return (
    <div class={cls('flex flex-row gap-1 text-sm leading-5', className)}>
      <span class='font-semibold text-gray-600'>
        {'Due to '}
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
