import { JSX } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import {
  FamilyRelation,
  GuardianFamilyRelation,
  PatientFamily,
} from '../../types.ts'
import { AddRow } from '../AddRemove.tsx'
import Guardian from './Guardian.tsx'
import SectionHeader from '../../components/library/typography/SectionHeader.tsx'
import Dependent from './Dependent.tsx'
import NextOfKin from './NextOfKin.tsx'
import MaritalStatusSelect from './MaritalStatusSelect.tsx'
import PatientCohabitationSelect from './PatientCohabitationSelect.tsx'
import FamilyTypeSelect from './FamilyTypeSelect.tsx'
import ReligionSelect from '../ReligionSelect.tsx'
import FormRow from '../form/Row.tsx'
import { SelectWithOptions } from '../form/Inputs.tsx'
import range from '../../util/range.ts'

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
  const family_type: Signal<string | undefined> = useSignal(
    family.family_type ?? undefined,
  )
  const addGuardian = () => guardians.value = guardians.value.concat([{}])
  const addDependent = () => dependents.value = dependents.value.concat([{}])

  const satisfactionValues = range(1, 11).map((n) => ({
    value: n,
    label: n.toString(),
  }))

  const showGuardians = age_years <= 18
  const showDependents = age_years >= 10
  const showNextOfKin = age_years >= 19
  const showPatientCohabitation = age_years <= 18

  //Default values
  family.marital_status ??= age_years <= 18 ? 'Never Married' : null

  return (
    <div>
      {showGuardians && (
        <input type='hidden' name='family.under_18' value='on' />
      )}
      {showNextOfKin &&
        (
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Next Of Kin
            </SectionHeader>
            <NextOfKin
              name='family.other_next_of_kin'
              value={family.other_next_of_kin ?? undefined}
            />
          </div>
        )}

      {showGuardians &&
        (
          <div>
            <SectionHeader className='my-5 text-[20px]'>
              Guardians
            </SectionHeader>
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
        )}

      {showDependents &&
        (
          <div>
            <SectionHeader className='my-5 text-[20px]'>
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

      <div>
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
          <SelectWithOptions
            label={'Home Environment/Family Satisfaction'}
            name='family.home_satisfaction'
            blank_option
            options={satisfactionValues}
            value={family.home_satisfaction ?? undefined}
          />
          <SelectWithOptions
            label={'Spiritual Environment/Religion Satisfaction'}
            name='family.spiritual_satisfaction'
            blank_option
            options={satisfactionValues}
            value={family.spiritual_satisfaction ?? undefined}
          />
          <SelectWithOptions
            label={'Social Environment/Community Satisfaction'}
            name='family.social_satisfaction'
            blank_option
            options={satisfactionValues}
            value={family.social_satisfaction ?? undefined}
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
      </div>
    </div>
  )
}
