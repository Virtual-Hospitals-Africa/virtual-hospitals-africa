import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../form/Inputs.tsx'
import { Diagnosis } from '../../types.ts'
import { JSX } from 'preact'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../form/Row.tsx'

export type DiagnosisFormRowState = {
  id?: string
  removed?: false
  comorbidities?: string[] // @Alice @Qiyuan Why did we add this back. These should not be here
  medications?: string[] // @Alice @Qiyuan Why did we add this back. These should not be here
}

export default function DiagnosisFormRow(
  {
    index,
    labelled,
    value,
    earliestSymptomDate,
    remove,
  }: {
    index: number
    labelled: boolean
    state: DiagnosisFormRowState
    value: Diagnosis | undefined
    earliestSymptomDate?: string
    remove(): void
    update(diagnosis: DiagnosisFormRowState): void
  },
): JSX.Element {
  const prefix = `diagnoses.${index}`

  return (
    <RemoveRow onClick={remove} key={index} labelled={labelled}>
      <div className='flex flex-col w-full gap-2'>
        <FormRow>
          <ConditionSearch
            label={labelled ? 'Condition name' : null}
            name={prefix}
            value={value}
          />
          <DateInput
            name={`${prefix}.start_date`}
            label={labelled ? 'Start Date' : null}
            value={value?.start_date || earliestSymptomDate}
            required
          />
        </FormRow>
      </div>
    </RemoveRow>
  )
}
