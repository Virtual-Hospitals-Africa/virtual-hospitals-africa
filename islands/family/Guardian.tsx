import { useState } from 'preact/hooks'
import { RemoveRow } from '../AddRemove.tsx'
import FormRow from '../../components/library/form/Row.tsx'
import {
  CheckboxInput,
  TextInput,
} from '../../components/library/form/Inputs.tsx'
import RelationshipSelect from './RelationshipSelect.tsx'
import PersonSearch from '../PersonSearch.tsx'
import { FamilyRelation } from '../../types.ts'

export default function Guardian({
  name,
  value,
  onRemove,
}: {
  name: string
  value?: Partial<Omit<FamilyRelation, 'relation_id'>>
  onRemove(): void
}) {
  const [patientGuardian, setPatientGuardian] = useState<
    Partial<FamilyRelation> | undefined
  >(value ?? undefined)

  return (
    <RemoveRow onClick={onRemove} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.patient`}
            href='/app/patients'
            label='Name'
            value={patientGuardian &&
              {
                id: patientGuardian.patient_id,
                name: patientGuardian.patient_name,
              }}
            required
            addable
            onSelect={(person) =>
              setPatientGuardian({
                patient_gender: person.gender ||
                  patientGuardian?.patient_gender,
                patient_phone_number: person.phone_number ||
                  patientGuardian?.patient_phone_number,
                patient_name: person.name || patientGuardian?.patient_name,
              })}
          />
          <RelationshipSelect
            name={`${name}.family_relation_gendered`}
            family_relation_gendered={patientGuardian
              ?.family_relation_gendered ?? undefined}
            type='guardian'
            gender={patientGuardian?.patient_gender}
          />
          <CheckboxInput
            name={`${name}.next_of_kin`}
            label='Next of kin'
            onInput={(event) => {
              //Only one kin allowed
              const target = event.target as HTMLInputElement
              if (target.checked) {
                const checkboxes = document.querySelectorAll(
                  'input[type="checkbox"]',
                )
                checkboxes.forEach(function (cb: Element) {
                  const input = cb as HTMLInputElement
                  if (cb !== target && input.name.includes('next_of_kin')) {
                    input.checked = false
                  }
                })
              }
            }}
          />
        </FormRow>
        <FormRow>
          <TextInput
            name={`${name}.patient_phone_number`}
            label='Phone Number'
            value={patientGuardian?.patient_phone_number}
          />
        </FormRow>
        {
          /* <FormRow>
          <TextInput name={`${name}.profession`} label='Profession' />
          <TextInput name={`${name}.work_location`} label='Work Location' />
          <ReligionSelect />
        </FormRow> */
        }
      </div>
    </RemoveRow>
  )
}
