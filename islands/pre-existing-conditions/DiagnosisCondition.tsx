import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../form/Inputs.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import { JSX } from 'preact'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../form/Row.tsx'

export type ConditionState = {
  id?: string
  removed?: false
}

export default function Condition(
  {
    index,
    value,
    remove,
  }: {
    index: number
    state: ConditionState
    value: PreExistingConditionWithDrugs | undefined
    remove(): void
    update(condition: ConditionState): void
  },
): JSX.Element {
  const prefix = `pre_existing_conditions.${index}`

  return (
    <RemoveRow onClick={remove} key={index} labelled>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <ConditionSearch
            label='Condition name'
            name={prefix}
            value={value}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label='Start Date'
            value={value?.start_date}
            required
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
