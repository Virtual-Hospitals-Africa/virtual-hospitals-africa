import { useRef } from 'preact/hooks'
import { RenderedFindingRelativeToHealthWorker } from '../types.ts'
import { FindingPanel } from '../components/library/FindingPanel.tsx'
import { useSignal } from '@preact/signals'
import cls from '../util/cls.ts'
import { PRIORITY_COLORS } from '../shared/priorities.ts'

export function RecordChips(
  { records, organization_id }: {
    records: RenderedFindingRelativeToHealthWorker[]
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

export function RecordChip(
  { record, organization_id }: {
    record: RenderedFindingRelativeToHealthWorker
    organization_id: string
  },
) {
  const chip_ref = useRef<HTMLDivElement>(null)
  const panel_ref = useRef<HTMLDivElement>(null)
  const is_hovered = useSignal(false)
  const align_right = useSignal(false)

  const colors = record.priority
    ? PRIORITY_COLORS[record.priority]
    : PRIORITY_COLORS.Normal
  const style_class = `${colors.bg} ${colors.text}`

  const handleMouseEnter = () => {
    is_hovered.value = true
    if (chip_ref.current && panel_ref.current) {
      const chip_rect = chip_ref.current.getBoundingClientRect()
      const panel_width = 296 // min-w-[296px] from FindingPanel
      const viewport_width = globalThis.innerWidth

      // Check if panel would overflow on the right when left-aligned
      const would_overflow_right =
        chip_rect.left + panel_width > viewport_width - 16

      align_right.value = would_overflow_right
    }
  }

  const handleMouseLeave = () => is_hovered.value = false

  return (
    <div
      ref={chip_ref}
      className={`group box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[2px] rounded-[60px] shrink-0 relative ${style_class}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre">
        {record.value_display}
      </p>
      <div
        ref={panel_ref}
        className={cls(`absolute z-50 pt-2 top-full`, {
          'right-0': align_right.value,
          'left-0': !align_right.value,
          'block': is_hovered.value,
          'hidden': !is_hovered.value,
        })}
      >
        <FindingPanel finding={record} organization_id={organization_id} />
      </div>
    </div>
  )
}
