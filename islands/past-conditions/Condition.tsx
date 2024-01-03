import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { PastMedicalCondition } from '../../types.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export type ConditionState = {
  removed: false
}

export default function Condition(
  {
    condition_id,
    condition_index,
    pastMedicalConditions,
    removeCondition,
  }: {
    condition_id: string | number
    condition_index: number
    pastMedicalConditions: PastMedicalCondition[]
    removeCondition(): void
  },
): JSX.Element {
  const matchingCondition = pastMedicalConditions.find(
    (condition) => condition.id === condition_id,
  )
  const prefix = `past_conditions.${condition_index}`

  return (
    <RemoveRow onClick={removeCondition} key={condition_id} labelled>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <ConditionSearch
            label='Condition name'
            name={prefix}
            value={matchingCondition}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label='Start Date'
            value={matchingCondition?.start_date}
            required
          />
          <DateInput
            name={`${prefix}.end_date`}
            label='End Date'
            value={matchingCondition?.end_date}
            required />
          {typeof condition_id === 'number' && (
            <input
              type='hidden'
              name={`${prefix}.id`}
              value={condition_id}
            />
          )}
        </FormRow>
      </div>
    </RemoveRow>
  )
}
