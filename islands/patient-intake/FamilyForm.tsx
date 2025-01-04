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
import MaritalStatusSelect from '../../islands/family/MaritalStatusSelect.tsx'
import PatientCohabitationSelect from '../../islands/family/PatientCohabitationSelect.tsx'
import FamilyTypeSelect from '../../islands/family/FamilyTypeSelect.tsx'
import ReligionSelect from '../ReligionSelect.tsx'
import FormRow from '../../components/library/FormRow.tsx'
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
  // const family_type: Signal<string | undefined> = useSignal(
  //   family.family_type ?? undefined,
  // )
  const addGuardian = () => guardians.value = guardians.value.concat([{}])
  const addDependent = () => dependents.value = dependents.value.concat([{}])

<<<<<<< HEAD
  const showGuardians = false //age_years <= 18
  const showDependents = false // age_years >= 10
  const showNextOfKin = true //age_years >= 19
  // const showPatientCohabitation = age_years <= 18
=======
  const showGuardians = age_years <= 18
  const showDependents = false // age_years >= 10
  const showNextOfKin = age_years >= 19
  const showPatientCohabitation = age_years <= 18
>>>>>>> d6a4c741 (Updating intake page with design changes)

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

      {
        /* <FormSection header='Family Status'>
        <FormRow>
          <MaritalStatusSelect
            label='Marital Status'
            name='family.marital_status'
            value={family.marital_status as string}
          />
          <ReligionSelect
            label='Religion'
            name='family.religion'
            value={family.religion as string}
          />
        </FormRow>
        <FormRow className='mt-2'>
          <FamilyTypeSelect
            label='Type of Family'
            name='family.family_type'
            value={family_type.value as string}
            onSelect={(t) => family_type.value = t}
          />
          {showPatientCohabitation && (
            <PatientCohabitationSelect
              label='If parents don`t live together, who usually stays with the patient?'
              name='family.patient_cohabitation'
              value={family.patient_cohabitation as string}
              type={family_type.value}
            />
          )}
        </FormRow>
      </FormSection> */
      }
    </>
  )
}
