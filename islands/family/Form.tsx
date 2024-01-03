import { JSX } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import { FamilyRelation, PatientFamily } from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Guardian from './Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'

type FamilyRelationState = Partial<Omit<FamilyRelation, 'relation_id'>> & {
  removed?: boolean
}

export default function PatientFamilyForm({
  family,
}: {
  family: PatientFamily
}): JSX.Element {
  const guardians: Signal<FamilyRelationState[]> = useSignal(family.guardians)
  const dependents: Signal<FamilyRelationState[]> = useSignal(family.dependents)
  const addGuardian = () => guardians.value = guardians.value.concat([{}])
  const addDependent = () => dependents.value = dependents.value.concat([{}])

  return (
    <div>
      <div>
        <SectionHeader className='my-5 text-[20px]'>Guardians</SectionHeader>
        {guardians.value.map((guardian, i) => (
          !guardian.removed &&
          (
            <Guardian
              value={guardian}
              key={i}
              name={`family.guardians.${i}`}
              onRemove={() =>
                guardians.value = guardians.value.map((guardian, ix) =>
                  i === ix ? { removed: true } : guardian
                )}
            />
          )
        ))}
        <AddRow
          text='Add Guardian'
          onClick={addGuardian}
        />
      </div>
      <div>
        <SectionHeader className='my-5 text-[20px]'>Dependents</SectionHeader>
        {dependents.value.map((dependent, i) => (
          !dependent.removed &&
          (
            <Dependent
              key={i}
              value={dependent}
              name={`family.dependents.${i}`}
              onRemove={() =>
                dependents.value = dependents.value.map((dependent, ix) =>
                  i === ix ? { removed: true } : dependent
                )}
            />
          )
        ))}
        <AddRow
          text='Add Dependents'
          onClick={addDependent}
        />
      </div>
    </div>
  )
}
