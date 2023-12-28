import { useState } from 'preact/hooks'
import { PreExistingConditionWithDrugs } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { JSX } from 'preact/jsx-runtime'
import { AddRow } from '../AddRemove.tsx'
import Guardian from './Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'

export default function PatientFamilyForm(): JSX.Element {
  const [patientGuardians, setPatientGuardians] = useState<Map<string, any>>([])
  const [patientDependents, setPatientDependents] = useState<Map<string, any>>(
    [],
  )

  const addGuardian = () => {
    const id = generateUUID()
    const guardians = new Map(patientGuardians)
    guardians.set(id, {})
    setPatientGuardians(new Map(guardians))
  }

  const addDependent = () => {
    const id = generateUUID()
    const dependents = new Map(patientDependents)
    dependents.set(id, {})
    setPatientDependents(new Map(dependents))
  }

  return (
    <div>
      <div>
        <SectionHeader className='my-5 text-[20px]'>Guardians</SectionHeader>
        {Array.from(patientGuardians.entries()).map(([key, guardian], i) => (
          !guardian.removed &&
          (
            <Guardian
              key={key}
              name={`guardians.${i}`}
              onRemove={() => {
                const nextGuardians = new Map(patientGuardians)
                const removedGuardian = nextGuardians.get(key)
                removedGuardian.removed = true
                setPatientGuardians(nextGuardians)
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
        {Array.from(patientDependents.entries()).map(([key, dependent], i) => (
          !dependent.removed &&
          (
            <Dependent
              key={key}
              name={`dependents.${i}`}
              onRemove={() => {
                const nextDependents = new Map(patientDependents)
                const removedDependent = nextDependents.get(key)
                removedDependent.removed = true
                setPatientDependents(nextDependents)
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