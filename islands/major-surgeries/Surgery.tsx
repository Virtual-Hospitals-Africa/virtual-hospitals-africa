import SurgerySearch from '../SurgerySearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { MajorSurgery } from '../../types.ts'
import { JSX } from 'preact/jsx-runtime'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export type SurgeryState = {
  removed: false
}

export default function Surgery(
  {
    index,
    value,
    remove,
  }: {
    index: number
    value?: MajorSurgery
    remove(): void
  },
): JSX.Element {
  const prefix = `major_surgeries.${index}`
  const labelled = index === 0

  return (
    <RemoveRow onClick={remove} labelled={labelled}>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <SurgerySearch
            label={labelled ? 'Surgery Name' : null}
            name={prefix}
            value={value}
          />
          <DateInput
            label={labelled ? 'Surgery Date' : null}
            name={`${prefix}.start_date`}
            value={value?.start_date}
            required
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
