import { JSX } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import { FamilyRelation, PatientFamily } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { AddRow } from '../AddRemove.tsx'
import Guardian from './Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'

type FamilyRelationState = Partial<Omit<FamilyRelation, 'relation_id'>> & {
  removed?: boolean
  relation_id?: number | string
}

export default function PatientFamilyForm({
  family,
}: {
  family: PatientFamily
}): JSX.Element {
  const guardians: Signal<FamilyRelationState[]> = useSignal(family.guardians)
  const dependents: Signal<FamilyRelationState[]> = useSignal(family.dependents)

  const addGuardian = () => {
    const relation_id = generateUUID()
    guardians.value = guardians.value.concat([{ relation_id }])
  }

  const addDependent = () => {
    const relation_id = generateUUID()
    dependents.value = dependents.value.concat([{ relation_id }])
  }

  return (
    <div>
      <div>
        <SectionHeader className='my-5 text-[20px]'>Guardians</SectionHeader>
        {guardians.value.map((guardian, i) => (
          !guardian.removed &&
          (
            <Guardian
              value={guardian}
              key={guardian.relation_id}
              name={`family.guardians.${i}`}
              onRemove={() => {
                guardians.value = guardians.value.map((g) =>
                  g.relation_id === guardian.relation_id
                    ? { ...g, removed: true }
                    : g
                )
              }}
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
              key={dependent.relation_id}
              value={dependent}
              name={`family.dependents.${i}`}
              onRemove={() => {
                dependents.value = dependents.value.map((d) =>
                  d.relation_id === dependent.relation_id
                    ? { ...d, removed: true }
                    : d
                )
              }}
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
