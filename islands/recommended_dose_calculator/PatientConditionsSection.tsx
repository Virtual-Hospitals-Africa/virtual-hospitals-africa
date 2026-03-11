import { useSignal } from '@preact/signals'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import { ICD10SearchSpecific } from '../icd10/SearchSpecific.tsx'

export default function PatientConditionsSection() {
  const conditions = useSignal([0])
  const next_id = useSignal(1)

  function addCondition() {
    conditions.value = [...conditions.value, next_id.value]
    next_id.value += 1
  }

  function removeCondition(id: number) {
    if (conditions.value.length <= 1) return
    conditions.value = conditions.value.filter((c) => c !== id)
  }

  return (
    <div className='flex flex-col gap-4'>
      {conditions.value.map((id, index) => (
        conditions.value.length > 1
          ? (
            <RemoveRow
              key={id}
              labelled={index === 0}
              onClick={() => removeCondition(id)}
            >
              <ICD10SearchSpecific
                name={`conditions.${index}`}
                label='Condition (ICD-10)'
                href='/clinical_decision_support_tools/icd10'
                className='w-full'
              />
            </RemoveRow>
          )
          : (
            <ICD10SearchSpecific
              key={id}
              name={`conditions.${index}`}
              label='Condition (ICD-10)'
              href='/clinical_decision_support_tools/icd10'
              className='w-full'
            />
          )
      ))}
      <AddRow text='Add Condition' onClick={addCondition} />
    </div>
  )
}
