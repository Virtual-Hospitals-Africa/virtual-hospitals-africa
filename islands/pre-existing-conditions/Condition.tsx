import ConditionSearch from '../ConditionSearch.tsx'
import { DateInput } from '../form/Inputs.tsx'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import { JSX } from 'preact'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import Comorbidity from './Comorbidity.tsx'
import Medication from './Medication.tsx'
import FormRow from '../form/Row.tsx'

export type ConditionState = {
  id?: string
  removed?: false
  comorbidities: Array<
    { id?: string; removed?: false } | { removed: true }
  >
  medications: Array<
    { id?: string; removed?: false } | { removed: true }
  >
}

export default function Condition(
  {
    index,
    state: { medications, comorbidities },
    value,
    remove,
    update,
  }: {
    index: number
    state: ConditionState
    value: PreExistingConditionWithDrugs | undefined
    remove(): void
    update(condition: ConditionState): void
  },
): JSX.Element {
  const prefix = `pre_existing_conditions.${index}`

  const addComorbidity = () => {
    const nextComorbidities = [...comorbidities, { removed: false }]
    const nextConditionState = {
      medications,
      comorbidities: nextComorbidities,
      removed: false as const,
    }
    update(nextConditionState)
  }

  const addMedication = () => {
    const nextMedications = [...medications, { removed: false }]
    const nextConditionState = {
      medications: nextMedications,
      comorbidities,
      removed: false as const,
    }
    update(nextConditionState)
  }

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
        {comorbidities.map((
          comorbidity,
          index,
        ) =>
          !comorbidity.removed && (
            <Comorbidity
              value={value?.comorbidities.find(
                (c) => c.id === comorbidity.id,
              )}
              prefix={prefix}
              index={index}
              remove={() => {
                const next_comorbidities = comorbidities.map((c) =>
                  c === comorbidity ? { removed: true as const } : c
                )
                const nextConditionState = {
                  medications,
                  comorbidities: next_comorbidities,
                }
                update(nextConditionState)
              }}
            />
          )
        )}
        <AddRow onClick={addComorbidity} text='Add Comorbidity' />
        {medications.map((
          medication,
          index,
        ) =>
          !medication.removed && (
            <Medication
              value={medication.id
                ? value?.medications.find(
                  (m) => m.id === medication.id,
                )
                : undefined}
              prefix={prefix}
              index={index}
              remove={() => {
                const nextMedications = medications.map((m) =>
                  m === medication ? { removed: true as const } : m
                )
                const nextConditionState = {
                  medications: nextMedications,
                  comorbidities,
                  removed: false as const,
                }
                update(nextConditionState)
              }}
            />
          )
        )}
        <AddRow onClick={addMedication} text='Add Medication' labelled />
      </div>
    </RemoveRow>
  )
}
