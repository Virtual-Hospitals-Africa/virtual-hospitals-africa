import { useSignal } from '@preact/signals'
import RemovableChip from '../../../components/RemovableChip.tsx'
import { MessageDraftTargetTable } from '../../../db.d.ts'
import remove from '../../../util/remove.ts'
import { ComponentChildren } from 'preact'

type TargetsRowProps<TargetType> = {
  label: string
  target_types: MessageDraftTargetTable[]
  targets: {
    target_type: TargetType
    target_value: string
    display_name: string
  }[]
  children?: ComponentChildren
}

export function TargetsRow<TargetType extends MessageDraftTargetTable>({
  label,
  target_types,
  targets,
  children,
}: TargetsRowProps<TargetType>) {
  const targets_signal = useSignal(targets)

  return (
    <div class='flex items-start gap-4'>
      <label class='text-sm font-medium text-gray-700 w-32 pt-2'>
        {label}
      </label>
      <div class='flex flex-wrap gap-2 flex-1 items-center'>
        <div class='flex flex-wrap gap-2'>
          {targets_signal.value.map((target) => (
            <RemovableChip
              key={target}
              name={`targets.${target.target_type}.${target.target_value}`}
              display={target.display_name}
              remove={() =>
                targets_signal.value = remove(targets_signal.value, target)}
            />
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}
