import { useSignal } from '@preact/signals'
import { MessageTargetCategory } from '../../../shared/message_targets.ts'
import AsyncSearch from '../../AsyncSearch.tsx'
import { RenderedMessageTarget } from '../../../types.ts'

type TargetsRowProps = {
  label: string
  message_target_category: MessageTargetCategory
  targets: RenderedMessageTarget[]
}

const placeholders = {
  regions: 'Search cities, towns, districts, and provinces',
  organizations: 'Search facilities and organization categories',
  health_workers: 'Search health workers and professions',
} satisfies {
  [c in MessageTargetCategory]: string
}

export function TargetsRow({
  label,
  message_target_category,
  targets,
}: TargetsRowProps) {
  const targets_signal = useSignal(targets)

  return (
    <div class='flex items-center gap-2 px-6 py-3 border-b border-gray-200'>
      <label class='text-sm text-gray-700 w-18 flex-shrink-0'>
        {label}
      </label>
      <div class='flex flex-col gap-2 flex-1'>
        <AsyncSearch
          multi
          signal={targets_signal}
          name={`targets.${message_target_category}`}
          placeholder={placeholders[message_target_category]}
          search_route={`/app/messaging/targets?message_target_category=${message_target_category}`}
          className='outline-none p-0'
        />
      </div>
    </div>
  )
}
