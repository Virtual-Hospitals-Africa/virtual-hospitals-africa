import { useSignal } from '@preact/signals'
import { RecordChips } from '../components/drawer-v4/RecordChips.tsx'
import { RenderedRecordRelativeToHealthWorker } from '../types.ts'

export function RoutineRecordsSummary(
  { label, records, organization_id }: {
    label: string
    records: RenderedRecordRelativeToHealthWorker[]
    organization_id: string
  },
) {
  const expanded = useSignal(false)

  return (
    <div>
      <button
        type='button'
        className='outline-none py-0.5 px-4 text-sm text-purple-600 hover:text-purple-800 underline cursor-pointer'
        onClick={() => expanded.value = !expanded.value}
      >
        {label}
      </button>
      {expanded.value && (
        <div className='mt-1'>
          <RecordChips records={records} organization_id={organization_id} />
        </div>
      )}
    </div>
  )
}
