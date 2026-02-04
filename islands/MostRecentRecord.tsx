import { twMerge } from 'tailwind-merge'
import { LocalTime } from './LocalTime.tsx'
import { Existence, Maybe, RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../types.ts'
import { cls } from '../util/cls.ts'
import { RecordPanel } from '../components/library/RecordPanel.tsx'

export function MostRecentRecord(
  { record, organization_id, omit_timestamp, display_variant = 'full', className }: {
    record: Maybe<
      (
        | RenderedFindingRelativeToHealthWorker
        | RenderedEvaluationRelativeToHealthWorker
      ) & {
        pertaining_to_key?: string
        existence?: Existence
      }
    >
    organization_id: string
    display_variant?: 'value' | 'full'
    omit_timestamp?: boolean
    className?: string
  },
) {
  if (!record) return null

  const display = display_variant === 'full' ? record.displays.full : (record.displays.value || record.displays.finding)
  return (
    <span
      tabIndex={0}
      className={twMerge('relative text-gray-500 group pb-2', className)}
      id={`most-recent-finding-${record.pertaining_to_key || record.id}`}
      onClick={(e) => {
        // Ensure the span gets focused when clicked (important for tablets)
        const target = e.currentTarget
        if (document.activeElement !== target) {
          target.focus()
        }
      }}
    >
      <span
        className={cls({
          'opacity-50': record.existence === 'No' ||
            record.existence === 'Unknown',
        })}
      >
        <a
          tabIndex={-1}
          className='text-blue-500'
          href={`#most-recent-finding-${record.pertaining_to_key || record.id}`}
        >
          {display}
        </a>
        {!omit_timestamp && (
          <>
            {' '}
            <LocalTime timestamp={record.created_at} expected_time_range='past' preceding_past_participle='recorded' />
          </>
        )}
      </span>

      <div className='absolute left-0 z-50 hidden pt-2 top-full group-hover:block group-focus-within:block hover:block'>
        <RecordPanel record={record} organization_id={organization_id} />
      </div>
    </span>
  )
}
