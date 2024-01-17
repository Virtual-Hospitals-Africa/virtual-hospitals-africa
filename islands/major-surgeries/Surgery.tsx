import SurgerySearch from '../SurgerySearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { MajorSurgery } from '../../types.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export type SurgeryState = {
  removed: false
}

export default function Surgery(
  {
    surgery_id,
    surgery_index,
    surgery_state,
    majorSurgeries,
    removeSurgery,
  }: {
    surgery_id: string | number
    surgery_index: number
    surgery_state: SurgeryState
    majorSurgeries: MajorSurgery[]
    removeSurgery(): void
  },
): JSX.Element {
  const matchingSurgery = majorSurgeries.find(
    (surgery) => surgery.id === surgery_id,
  )
  const prefix = `major_surgeries.${surgery_index}`

  return (
    <RemoveRow onClick={removeSurgery} key={surgery_id} labelled>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <SurgerySearch
            label='Surgery name'
            name={prefix}
            value={matchingSurgery}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label='Surgery Date'
            value={matchingSurgery?.start_date}
            required
          />
          {typeof surgery_id === 'number' && (
            <input
              type='hidden'
              name={`${prefix}.id`}
              value={surgery_id}
            />
          )}
        </FormRow>
      </div>
    </RemoveRow>
  )
}
