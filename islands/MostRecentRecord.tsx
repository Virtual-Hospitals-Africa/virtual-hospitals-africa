import { LocalTime } from './LocalTime.tsx'
import { Existence, Maybe, RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../types.ts'
import { cls } from '../util/cls.ts'
import { RecordPanel } from '../components/library/RecordPanel.tsx'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

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
    <Popover
      id={`most-recent-finding-${record.pertaining_to_key || record.id}`}
      className={cls('relative', className)}
    >
      {
        /* <span
        className={cls({
          'opacity-50': record.existence === 'No' ||
            record.existence === 'Unknown',
        })}
      > */
      }
      <PopoverButton
        // tabIndex={-1}
        className='text-blue-500'
        onClick={(event) => {
          console.log('lkwelkwelk', event)
        }}
        // href={`#most-recent-finding-${record.pertaining_to_key || record.id}`}
      >
        {display}
      </PopoverButton>
      {!omit_timestamp && (
        <>
          {' '}
          <LocalTime timestamp={record.created_at} expected_time_range='past' preceding_past_participle='recorded' />
        </>
      )}
      {/* </span> */}
      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8, padding: 8 }}
        className='panel z-50 transition duration-100 ease-out'
      >
        <RecordPanel record={record} organization_id={organization_id} />
      </PopoverPanel>
    </Popover>
  )
}
