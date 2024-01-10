import { JSX } from 'preact'
import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../../components/library/form/Inputs.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'

export default function Comorbidity({
  value,
  prefix,
  index,
  remove,
}: {
  value?: PreExistingConditionWithDrugs['comorbidities'][0]
  prefix: string
  index: number
  remove(): void
}): JSX.Element {
  const name = `${prefix}.comorbidities.${index}`
  return (
    <RemoveRow onClick={remove} key={index}>
      <FormRow>
        <ConditionSearch
          name={name}
          value={value}
        />
        <DateInput
          name={`${name}.start_date`}
          label={null}
          value={value?.start_date}
        />
      </FormRow>
    </RemoveRow>
  )
}
