import { DrugSearchResultMedication, MedicationSchedule } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'
import { ScheduleInput } from './ScheduleInput.tsx'

export function ScheduleRow({
  name,
  value,
  medication,
  strength_numerator,
  remove,
}: {
  name: string
  value: Partial<MedicationSchedule>
  medication: DrugSearchResultMedication | undefined
  strength_numerator: number | undefined
  remove?: () => void
}) {
  if (!remove) {
    return (
      <div className='pl-8'>
        <ScheduleInput
          labelled
          name={name}
          value={value}
          medication={medication}
          strength_numerator={strength_numerator}
        />
      </div>
    )
  }

  return (
    <RemoveRow onClick={remove} key={name}>
      <ScheduleInput
        name={name}
        value={value}
        medication={medication}
        strength_numerator={strength_numerator}
      />
    </RemoveRow>
  )
}
