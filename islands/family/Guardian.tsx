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
  key,
  name,
  value,
  onRemove,
}: {
  key: string
  name: string
  value?: FamilyRelation
  onRemove(): void
}) {
  const [patientGuardian, setPatientGuardian] = useState<
    FamilyRelation | undefined
  >(value ?? undefined)

  return (
    <RemoveRow onClick={onRemove} key={'test'} labelled>
      <div class='w-full justify-normal'>
        <FormRow>
          <PersonSearch
            name={`${name}.patient`}
            href='/app/patients'
            label='Name'
            value={{ id: value?.patient_id!, name: value!.patient_name! }}
            required
            addable
            onSelect={(person) =>
              setPatientGuardian({
                ...value!,
                patient_gender: person.gender,
                patient_phone_number: person.phone_number,
                patient_name: person.name,
              })}
          />
          <RelationshipSelect
            name={`${name}.family_relation`}
            value={patientGuardian?.family_relation ?? undefined}
            type='guardian'
            gender={patientGuardian?.patient_gender ?? undefined}
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
      {patientGuardian && patientGuardian.relation_id && (
        <input
          type='hidden'
          name={`${name}.relation_id`}
          value={patientGuardian.relation_id}
        />
      )}
    </RemoveRow>
  )
}
