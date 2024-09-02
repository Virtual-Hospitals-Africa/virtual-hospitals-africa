import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../form/Inputs.tsx'
import { PastMedicalCondition } from '../../types.ts'
import { JSX } from 'preact/jsx-runtime'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../form/Row.tsx'

export default function Condition(
  {
    index,
    labelled,
    value,
    remove,
  }: {
    index: number
    labelled: boolean
    value?: PastMedicalCondition
    remove(): void
  },
): JSX.Element {
  const prefix = `past_medical_conditions.${index}`

  return (
    <RemoveRow onClick={remove} labelled={labelled}>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <ConditionSearch
            name={prefix}
            label={labelled ? 'Condition name' : null}
            value={value}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label={labelled ? 'Start Date' : null}
            value={value?.start_date}
            required
          />
          <DateInput
            name={`${prefix}.end_date`}
            label={labelled ? 'End Date' : null}
            value={value?.end_date}
            required
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
