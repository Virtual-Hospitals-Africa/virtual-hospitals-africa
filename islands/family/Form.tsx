import { JSX } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import { FamilyRelation, PatientFamily } from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Guardian from './Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'
import Kin from './Kin.tsx'

type FamilyRelationState = Partial<Omit<FamilyRelation, 'relation_id'>> & {
  removed?: boolean
}

export default function PatientFamilyForm({
  family,
  age,
}: {
  family: PatientFamily
  age: number
}): JSX.Element {
  const guardians: Signal<FamilyRelationState[]> = useSignal(family.guardians)
  const dependents: Signal<FamilyRelationState[]> = useSignal(family.dependents)
  const nextOfKin: Signal<FamilyRelationState> = useSignal(family.next_of_kin)

  const addGuardian = () => guardians.value = guardians.value.concat([{}])
  const addDependent = () => dependents.value = dependents.value.concat([{}])

  const showGuardians = age <= 18
  const showDependents = age >= 10
  const showNextOfKin = age >= 19
  const hideNextofKinForm = showGuardians && !showNextOfKin

  return (
    <div>
      {showNextOfKin || true && (
        <div style={{display: hideNextofKinForm ? 'none' : 'block' }}>
          <SectionHeader className='my-5 text-[20px]'>
            Next Of Kin
          </SectionHeader>
          <Kin name='family.next_of_kin' value={nextOfKin.value} />
        </div>
      )}

      {showGuardians && (
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
                onSelect={(guardian) => {
                  if(guardian.next_of_kin){
                   nextOfKin.value = guardian
                  }
                }}
              />
            )
          ))}
          <AddRow
            text='Add Guardian'
            onClick={addGuardian}
          />
        </div>
      )}
      {showDependents && (
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
      )}
    </div>
  )
}
