import { JSX } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import {
  FamilyRelation,
  GuardianFamilyRelation,
  PatientFamily,
} from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Guardian from '../../islands/family/Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from '../../islands/family/Dependent.tsx'
import NextOfKinInput from '../../islands/family/NextOfKin.tsx'
import FormSection from '../../components/library/FormSection.tsx'

type GuardianFamilyRelationState =
  & Partial<Omit<GuardianFamilyRelation, 'relation_id'>>
  & {
    removed?: boolean
  }
type DependentFamilyRelationState =
  & Partial<Omit<FamilyRelation, 'relation_id'>>
  & {
    removed?: boolean
  }

export default function PatientFamilyForm({
  family,
  age_years,
}: {
  family: PatientFamily
  age_years: number
}): JSX.Element {
  const guardians: Signal<GuardianFamilyRelationState[]> = useSignal(
    family.guardians,
  )
  const dependents: Signal<DependentFamilyRelationState[]> = useSignal(
    family.dependents,
  )

  const addGuardian = () => guardians.value = guardians.value.concat([{}])
  const addDependent = () => dependents.value = dependents.value.concat([{}])

  const showGuardians = false //age_years <= 18
  const showDependents = false // age_years >= 10
  const showNextOfKin = true //age_years >= 19
  // const showPatientCohabitation = age_years <= 18

  //Default values
  family.marital_status ??= age_years <= 18 ? 'Never Married' : null

  return (
    <>
      {showGuardians && (
        <input type='hidden' name='family.under_18' value='on' />
      )}
      {showNextOfKin &&
        (
          <FormSection header='Next Of Kin'>
            <NextOfKinInput
              name='family.other_next_of_kin'
              value={family.other_next_of_kin ?? undefined}
            />
          </FormSection>
        )}

      {showGuardians &&
        (
          <FormSection header='Guardians'>
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
          </FormSection>
        )}

      {showDependents &&
        (
          <div>
            <SectionHeader>
              Dependents
            </SectionHeader>
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
    </>
  )
}
