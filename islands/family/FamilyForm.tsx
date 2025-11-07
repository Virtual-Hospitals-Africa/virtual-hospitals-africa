import { Signal, useSignal } from '@preact/signals'
import { JSX } from 'preact'
import FormSection from '../../components/library/FormSection.tsx'
import {
  FamilyRelation,
  GuardianFamilyRelation,
  NextOfKin,
  PatientFamily,
} from '../../types.ts'
import NextOfKinInput from './NextOfKin.tsx'
import Guardian from './Guardian.tsx'
import { AddRow } from '../AddRemove.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'

type GuardianFamilyRelationState =
  & Partial<
    Omit<GuardianFamilyRelation, 'relation_id'>
  >
  & {
    removed?: boolean
  }
type DependentFamilyRelationState =
  & Partial<
    Omit<FamilyRelation, 'relation_id'>
  >
  & {
    removed?: boolean
  }

export function NextOfKinFormSection({
  next_of_kin,
}: {
  next_of_kin?: Partial<NextOfKin>
}) {
  return (
    <FormSection header='Next Of Kin'>
      <NextOfKinInput name='family.next_of_kin' value={next_of_kin} />
    </FormSection>
  )
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

  const addGuardian = () => {
    guardians.value = guardians.value.concat([{}])
  }
  const addDependent = () => {
    dependents.value = dependents.value.concat([{}])
  }

  const show_guardians = age_years <= 18
  const show_dependents = age_years >= 10
  const show_next_of_kin = age_years >= 19
  // const showPatient_cohabitation =age_years <= 18

  //Default values
  family.marital_status ??= age_years <= 18 ? 'Never Married' : null

  return (
    <>
      {show_guardians && (
        <input type='hidden' name='family.under_18' value='on' />
      )}
      {show_next_of_kin && (
        <NextOfKinFormSection next_of_kin={family.next_of_kin} />
      )}

      {show_guardians &&
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

      {show_dependents &&
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
